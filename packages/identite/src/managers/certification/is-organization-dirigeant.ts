//

import * as ApiEntrepriseMap from "#src/api/api_entreprise/mappers";
import * as InseeMap from "#src/api/insee/mappers";
import { InvalidCertificationError, NotFoundError } from "#src/errors";
import type { GetFranceConnectUserInfoHandler } from "#src/repositories/user";
import { isEntrepriseUnipersonnelle } from "#src/services/organization";
import type { IdentityVector, Organization } from "#src/types";
import type {
  ApiEntrepriseInfogreffeRepository,
  ApiEntrepriseInseeRepository,
} from "@proconnect-gouv/proconnect.api_entreprise/api";
import type { InseeApiRepository } from "@proconnect-gouv/proconnect.insee/api";
import { match } from "ts-pattern";
import z from "zod/v4";
import { distance } from "./distance.js";

//

type IsOrganizationExecutiveFactoryFactoryConfig = {
  ApiEntrepriseInfogreffeRepository: ApiEntrepriseInfogreffeRepository;
  ApiEntrepriseInseeRepository: Pick<
    ApiEntrepriseInseeRepository,
    "findBySiret"
  >;
  EQUALITY_THRESHOLD?: number;
  getFranceConnectUserInfo: GetFranceConnectUserInfoHandler;
  InseeApiRepository: Pick<InseeApiRepository, "findBySiret">;
};

//

export function isOrganizationDirigeantFactory(
  config: IsOrganizationExecutiveFactoryFactoryConfig,
) {
  const {
    ApiEntrepriseInseeRepository,
    ApiEntrepriseInfogreffeRepository,
    InseeApiRepository,
    getFranceConnectUserInfo,
  } = config;

  return async function isOrganizationDirigeant(
    siret: string,
    user_id: number,
  ) {
    const organization = await ApiEntrepriseInseeRepository.findBySiret(
      siret,
    ).then(ApiEntrepriseMap.toOrganizationInfo);

    const franceconnectUserInfo = await getFranceConnectUserInfo(user_id);
    if (!franceconnectUserInfo) {
      throw new NotFoundError("FranceConnect UserInfo not found");
    }

    const source = determine_source_dirigeant_source({
      cached_libelle_categorie_juridique:
        organization.libelleCategorieJuridique,
      cached_tranche_effectifs: organization.trancheEffectifs,
    });

    const sourceDirigeants = await match(source)
      .with("api.insee.fr/api-sirene/private", () =>
        InseeApiRepository.findBySiret(siret)
          .then(InseeMap.toIdentityVector)
          .then((vector) => [vector]),
      )
      .with(
        "entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux",
        () =>
          ApiEntrepriseInfogreffeRepository.findMandatairesSociauxBySiren(
            siret.substring(0, 9),
          ).then((mandataires) =>
            mandataires.map(ApiEntrepriseMap.toIdentityVector),
          ),
      )
      .exhaustive();

    const result = match_identity_to_dirigeant(
      franceconnectUserInfo,
      sourceDirigeants,
    );

    if (result.kind === "no_candidates")
      throw new InvalidCertificationError("No candidates found");
    return {
      details: {
        ...result.closest,
        identity: franceconnectUserInfo,
        source,
      },
      cause: result.kind,
      ok: result.kind === "exact_match",
    };
  };
}

export type IsOrganizationDirigeantHandler = ReturnType<
  typeof isOrganizationDirigeantFactory
>;

const SourceDirigeant = z.enum([
  "api.insee.fr/api-sirene/private",
  "entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux",
  "registre-national-entreprises.inpi.fr/api",
]);

function determine_source_dirigeant_source(
  organization: Pick<
    Organization,
    "cached_libelle_categorie_juridique" | "cached_tranche_effectifs"
  >,
) {
  return isEntrepriseUnipersonnelle(organization)
    ? SourceDirigeant.enum["api.insee.fr/api-sirene/private"]
    : SourceDirigeant.enum[
        "entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux"
      ];
}

function match_identity_to_dirigeant(
  identity: IdentityVector,
  dirigeants: IdentityVector[],
) {
  if (dirigeants.length === 0) return { kind: "no_candidates" as const };

  const [closest] = dirigeants
    .map((dirigeant) => ({
      dirigeant,
      distance: Math.abs(distance(identity, dirigeant)),
    }))
    .toSorted((a, b) => a.distance - b.distance);

  if (closest.distance > 0)
    return {
      kind: "below_threshold" as const,
      closest,
    };

  return {
    kind: "exact_match" as const,
    closest,
  };
}
