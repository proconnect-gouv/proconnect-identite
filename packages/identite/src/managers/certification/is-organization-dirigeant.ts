//

import { NotFoundError } from "#src/errors";
import type { GetFranceConnectUserInfoHandler } from "#src/repositories/user";
import { isOrganizationCoveredByCertificationDirigeant } from "#src/services/organization";
import {
  IdentityVectorZero,
  type IdentityVector,
  type Organization,
} from "#src/types";
import type { ApiEntrepriseInfogreffeRepository } from "@proconnect-gouv/proconnect.api_entreprise/api";
import type { FindUniteLegaleBySirenHandler } from "@proconnect-gouv/proconnect.insee/api";
import type { FindPouvoirsBySirenHandler } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { match } from "ts-pattern";
import z from "zod/v4";
import * as ApiEntreprise from "./adapters/api_entreprise.js";
import * as FranceConnect from "./adapters/franceconnect.js";
import * as INSEE from "./adapters/insee.js";
import * as RNE from "./adapters/rne.js";
import { certificationScore } from "./certification-score.js";

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
  } catch (error) {
    console.error(error);
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
    if (!isOrganizationCoveredByCertificationDirigeant(organization)) {
      return {
        details: {
          identity: IdentityVectorZero,
          matches: new Set(),
        },
        cause: "organisation_not_covered" as const,
        ok: false,
      };
    }

    const siren = organization.siret.substring(0, 9);
    const franceconnectUserInfo =
      await FranceConnectApiRepository.getFranceConnectUserInfo(user_id);
    if (!franceconnectUserInfo) {
      throw new NotFoundError("FranceConnect UserInfo not found");
    }

    const identity = FranceConnect.toIdentityVector(franceconnectUserInfo);

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

    if (result.kind === "no_candidates") {
      return {
        details: { dirigeant: undefined, identity, matches: new Set(), source },
        cause: result.kind,
        ok: false,
      };
    }

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

export const SourceDirigeant = z.enum([
  "api.insee.fr/api-sirene/private",
  "entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux",
  "registre-national-entreprises.inpi.fr/api",
]);

export type SourceDirigeant = z.infer<typeof SourceDirigeant>;

const SOURCE_DIRIGEANT_LABELS: { [source in SourceDirigeant]: string } = {
  "api.insee.fr/api-sirene/private": "Répertoire SIRENE de l'INSEE",
  "entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux":
    "Registre du commerce et des sociétés (RCS)",
  "registre-national-entreprises.inpi.fr/api":
    "Registre National des Entreprises",
};
export function getSourceDirigeantInfo(source: SourceDirigeant) {
  return SOURCE_DIRIGEANT_LABELS[source];
}

function match_identity_to_dirigeant(
  identity: IdentityVector,
  dirigeants: IdentityVector[],
) {
  if (dirigeants.length === 0) return { kind: "no_candidates" as const };

  const [closest] = dirigeants
    .map((dirigeant) => ({
      dirigeant,
      matches: certificationScore(identity, dirigeant),
    }))
    .toSorted((a, b) => b.matches.size - a.matches.size); // Sort by score descending (higher is better)

  // According to the specification, only score of 5 (perfect match) is certified
  return match(closest.matches.size)
    .with(5, () => ({
      kind: "exact_match" as const,
      closest,
    }))
    .with(4, () => ({
      kind: "close_match" as const,
      closest,
    }))
    .with(3, () => ({
      kind: "close_match" as const,
      closest,
    }))
    .otherwise(() => ({
      kind: "below_threshold" as const,
      closest,
    }));
}
