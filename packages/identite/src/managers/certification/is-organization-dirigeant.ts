//

import { InvalidCertificationError, NotFoundError } from "#src/errors";
import type { GetFranceConnectUserInfoHandler } from "#src/repositories/user";
import type { IdentityVector, Organization } from "#src/types";
import type { ApiEntrepriseInfogreffeRepository } from "@proconnect-gouv/proconnect.api_entreprise/api";
import type { FindUniteLegaleBySirenHandler } from "@proconnect-gouv/proconnect.insee/api";
import type { FindPouvoirsBySirenHandler } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { match } from "ts-pattern";
import z from "zod/v4";
import * as ApiEntreprise from "./adapters/api_entreprise.js";
import * as INSEE from "./adapters/insee.js";
import * as RNE from "./adapters/rne.js";
import { distance } from "./distance.js";

//

type IsOrganizationExecutiveFactoryFactoryConfig = {
  ApiEntrepriseInfogreffeRepository: Pick<
    ApiEntrepriseInfogreffeRepository,
    "findMandatairesSociauxBySiren"
  >;
  EQUALITY_THRESHOLD?: number;
  FranceConnectApiRepository: {
    getFranceConnectUserInfo: GetFranceConnectUserInfoHandler;
  };
  InseeApiRepository: { findBySiren: FindUniteLegaleBySirenHandler };
  RegistreNationalEntreprisesApiRepository: {
    findPouvoirsBySiren: FindPouvoirsBySirenHandler;
  };
};

//

async function getMandatairesSociaux(
  {
    RegistreNationalEntreprisesApiRepository,
    ApiEntrepriseInfogreffeRepository,
  }: IsOrganizationExecutiveFactoryFactoryConfig,
  siren: string,
) {
  try {
    const pouvoirs =
      await RegistreNationalEntreprisesApiRepository.findPouvoirsBySiren(siren);
    const dirigeants = pouvoirs.map(RNE.toIdentityVector);

    return {
      dirigeants,
      source: SourceDirigeant.enum["registre-national-entreprises.inpi.fr/api"],
    };
  } catch {
    const mandataires =
      await ApiEntrepriseInfogreffeRepository.findMandatairesSociauxBySiren(
        siren,
      );
    const dirigeants = mandataires.map(ApiEntreprise.toIdentityVector);

    return {
      dirigeants,
      source:
        SourceDirigeant.enum[
          "entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux"
        ],
    };
  }
}

export function isOrganizationDirigeantFactory(
  config: IsOrganizationExecutiveFactoryFactoryConfig,
) {
  const { InseeApiRepository, FranceConnectApiRepository } = config;

  return async function isOrganizationDirigeant(
    organization: Organization,
    user_id: number,
  ) {
    const siren = organization.siret.substring(0, 9);
    const franceconnectUserInfo =
      await FranceConnectApiRepository.getFranceConnectUserInfo(user_id);
    if (!franceconnectUserInfo) {
      throw new NotFoundError("FranceConnect UserInfo not found");
    }

    // Map FranceConnect gender to standard format
    const mapGender = (gender: string | undefined) => {
      const lowerGender = gender?.toLowerCase();
      if (lowerGender === "male" || lowerGender === "m") return "male";
      if (lowerGender === "female" || lowerGender === "f") return "female";
      return null;
    };

    const identity: IdentityVector = {
      birthplace: franceconnectUserInfo.birthplace,
      birthdate: franceconnectUserInfo.birthdate,
      family_name: franceconnectUserInfo.family_name,
      gender: mapGender(franceconnectUserInfo.gender),
      given_name: franceconnectUserInfo.given_name,
    };

    const prefered_source =
      organization.cached_libelle_categorie_juridique ===
      "Entrepreneur individuel"
        ? SourceDirigeant.enum["api.insee.fr/api-sirene/private"]
        : SourceDirigeant.enum["registre-national-entreprises.inpi.fr/api"];

    const { dirigeants, source } = await match(prefered_source)
      .with("api.insee.fr/api-sirene/private", async () => ({
        dirigeants: await InseeApiRepository.findBySiren(siren)
          .then(INSEE.toIdentityVector)
          .then((vector) => [vector]),
        source: SourceDirigeant.enum["api.insee.fr/api-sirene/private"],
      }))
      .with("registre-national-entreprises.inpi.fr/api", () =>
        getMandatairesSociaux(config, siren),
      )
      .exhaustive();

    const result = match_identity_to_dirigeant(identity, dirigeants);

    if (result.kind === "no_candidates")
      throw new InvalidCertificationError("No candidates found");
    return {
      details: {
        ...result.closest,
        identity,
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
