//

import type { Context } from "#src/connectors";
import { isOrganizationCoveredByCertificationDirigeant } from "#src/services/organization";
import {
  NullIdentityVector,
  type FranceConnectUserInfo,
  type Organization,
} from "#src/types";
import { match } from "ts-pattern";
import z from "zod/v4";
import * as ApiEntreprise from "./adapters/api_entreprise.js";
import * as FranceConnect from "./adapters/franceconnect.js";
import * as INSEE from "./adapters/insee.js";
import * as RNE from "./adapters/rne.js";
import { match_identity_to_dirigeant } from "./match-identity-to-dirigeant.js";

//

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
  { client: { api_entreprise, rne } }: Context,
  siren: string,
) {
  try {
    const pouvoirs = await rne.findPouvoirsBySiren(siren);
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
      await api_entreprise.findMandatairesSociauxBySiren(siren);
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

export function processCertificationDirigeantFactory(context: Context) {
  const {
    client: { insee },
  } = context;

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
        dirigeants: await insee
          .findBySiren(siren)
          .then(INSEE.toIdentityVector)
          .then((vector) => [vector]),
        source:
          CertificationDirigeantDataSource.enum[
            "api.insee.fr/api-sirene/private"
          ],
      }))
      .with("registre-national-entreprises.inpi.fr/api", () =>
        getMandatairesSociaux(context, siren),
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
