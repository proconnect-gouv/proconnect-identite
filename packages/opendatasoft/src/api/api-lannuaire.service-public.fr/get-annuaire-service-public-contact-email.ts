//

import type { OpendatasoftOpenApiClient } from "#src/client";
import {
  ApiOpendatasoftConnectionError,
  ApiOpendatasoftNotFoundError,
  ApiOpendatasoftUnprocessableEntityError,
  type ApiLannuaireAdministrationRecord,
  type SelectedAdministrationRecord,
} from "#src/types";
import { isEmailValid } from "@gouvfr-lasuite/proconnect.core/security";
import { isEmpty } from "@gouvfr-lasuite/proconnect.core/utils/lodash";
import type { FetchOptions } from "openapi-fetch";

//

export function getAnnuaireServicePublicContactEmailFactory(
  client: OpendatasoftOpenApiClient,
  optionsFn: () => FetchOptions<unknown> = () => ({}),
) {
  return async function getAnnuaireServicePublicContactEmail(
    codeOfficielGeographique: string | null,
    codePostal: string | null,
  ): Promise<string> {
    if (isEmpty(codeOfficielGeographique))
      throw new ApiOpendatasoftNotFoundError();

    const { data, error } = await client.GET(
      "/catalog/datasets/{dataset_id}/records",
      {
        ...optionsFn(),
        params: {
          path: {
            dataset_id: "api-lannuaire-administration",
          },
          query: {
            select: [
              "adresse_courriel",
              "adresse",
              "code_insee_commune",
              "nom",
            ].join(", "),
            where: [
              `code_insee_commune LIKE "${codeOfficielGeographique}"`,
              `pivot LIKE "mairie"`,
            ].join(" and "),
          },
        },
      },
    );

    if (error) throw new ApiOpendatasoftConnectionError("", { cause: error });
    if (!data?.results)
      throw new ApiOpendatasoftUnprocessableEntityError("Response malformed");

    type Administration = SelectedAdministrationRecord & {
      adresse: [{ code_postal: string }];
    };
    const features: Administration[] = data.results.map(
      (feature: ApiLannuaireAdministrationRecord) => ({
        ...feature,
        // HACK(douglasduteil): the API returns a string instead of a JSON object in the adresse field
        adresse: JSON.parse(feature.adresse ?? "[]"),
      }),
    );

    let feature: Administration | undefined;

    if (features.length === 1) {
      feature = features[0];
    } else if (features.length > 1) {
      if (!codePostal) {
        throw new ApiOpendatasoftUnprocessableEntityError(
          `Without postal code, we cannot choose a mairie between ${features.length} results.`,
        );
      }

      // Take the first match
      feature = features.find(
        ({ adresse: [{ code_postal: codePostalMairie }] }) =>
          codePostalMairie === codePostal,
      );
    }

    if (!feature) {
      throw new ApiOpendatasoftNotFoundError(
        `No pair found for (codeOfficielGeographique: ${codeOfficielGeographique}, codePostal: ${codePostal}).`,
      );
    }

    const { adresse_courriel } = feature;
    const formattedEmail = adresse_courriel?.toLowerCase().trim();

    if (!isEmailValid(formattedEmail)) {
      throw new ApiOpendatasoftUnprocessableEntityError(
        `${formattedEmail} is not a valid email address.`,
      );
    }

    return formattedEmail;
  };
}

export type GetAnnuaireServicePublicContactEmailHandler = ReturnType<
  typeof getAnnuaireServicePublicContactEmailFactory
>;
