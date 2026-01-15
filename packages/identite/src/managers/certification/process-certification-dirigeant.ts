//

import { isOrganizationCoveredByCertificationDirigeant } from "#src/services/organization";
import {
  NullIdentityVector,
  type FranceConnectUserInfo,
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

type ProcessCertificationDirigeantConfig = {
  ApiEntrepriseInfogreffeRepository: Pick<
    ApiEntrepriseInfogreffeRepository,
    "findMandatairesSociauxBySiren"
  >;
  EQUALITY_THRESHOLD?: number;
  InseeApiRepository: { findBySiren: FindUniteLegaleBySirenHandler };
  RegistreNationalEntreprisesApiRepository: {
    findPouvoirsBySiren: FindPouvoirsBySirenHandler;
  };
};

export const CertificationDirigeantDataSource = z.enum([
  "api.insee.fr/api-sirene/private",
  "entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux",
  "registre-national-entreprises.inpi.fr/api",
]);

export type CertificationDirigeantDataSource = z.infer<
  typeof CertificationDirigeantDataSource
>;

const CERTIFICATION_DIRIGEANT_DATA_SOURCE_LABELS: {
  [source in CertificationDirigeantDataSource]: string;
} = {
  "api.insee.fr/api-sirene/private": "Répertoire SIRENE de l'INSEE",
  "entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux":
    "Registre du commerce et des sociétés (RCS)",
  "registre-national-entreprises.inpi.fr/api":
    "Registre National des Entreprises",
};
export function getCertificationDirigeantDataSourceLabels(
  dataSource: CertificationDirigeantDataSource,
) {
  return CERTIFICATION_DIRIGEANT_DATA_SOURCE_LABELS[dataSource];
}

//

async function getMandatairesSociaux(
  {
    RegistreNationalEntreprisesApiRepository,
    ApiEntrepriseInfogreffeRepository,
  }: ProcessCertificationDirigeantConfig,
  siren: string,
) {
  try {
    const pouvoirs =
      await RegistreNationalEntreprisesApiRepository.findPouvoirsBySiren(siren);
    const dirigeants = pouvoirs.map(RNE.toIdentityVector);

    return {
      dirigeants,
      source:
        CertificationDirigeantDataSource.enum[
          "registre-national-entreprises.inpi.fr/api"
        ],
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
        CertificationDirigeantDataSource.enum[
          "entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux"
        ],
    };
  }
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

export function processCertificationDirigeantFactory(
  config: ProcessCertificationDirigeantConfig,
) {
  const { InseeApiRepository } = config;

  return async function processCertificationDirigeant(
    organization: Organization,
    franceconnect_userinfo: FranceConnectUserInfo,
  ) {
    if (!isOrganizationCoveredByCertificationDirigeant(organization)) {
      return {
        details: {
          dirigeant: null,
          matches: new Set(),
          identity: NullIdentityVector,
          source: null,
        },
        cause: "organisation_not_covered" as const,
        ok: false,
      };
    }

    const siren = organization.siret.substring(0, 9);
    const identity = FranceConnect.toIdentityVector(franceconnect_userinfo);

    const preferredDataSource =
      organization.cached_libelle_categorie_juridique ===
      "Entrepreneur individuel"
        ? CertificationDirigeantDataSource.enum[
            "api.insee.fr/api-sirene/private"
          ]
        : CertificationDirigeantDataSource.enum[
            "registre-national-entreprises.inpi.fr/api"
          ];

    const { dirigeants, source } = await match(preferredDataSource)
      .with("api.insee.fr/api-sirene/private", async () => ({
        dirigeants: await InseeApiRepository.findBySiren(siren)
          .then(INSEE.toIdentityVector)
          .then((vector) => [vector]),
        source:
          CertificationDirigeantDataSource.enum[
            "api.insee.fr/api-sirene/private"
          ],
      }))
      .with("registre-national-entreprises.inpi.fr/api", () =>
        getMandatairesSociaux(config, siren),
      )
      .exhaustive();

    const result = match_identity_to_dirigeant(identity, dirigeants);

    if (result.kind === "no_candidates") {
      return {
        details: { dirigeant: undefined, matches: new Set(), identity, source },
        cause: result.kind,
        ok: false,
      };
    }

    return {
      details: {
        dirigeant: result.closest.dirigeant,
        matches: result.closest.matches,
        identity,
        source,
      },
      cause: result.kind,
      ok: result.kind === "exact_match",
    };
  };
}
