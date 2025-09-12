//

import type { OpendatasoftOpenApiClient } from "#src/client/";
import {
  ApiOpendatasoftConnectionError,
  ApiOpendatasoftNotFoundError,
  ApiOpendatasoftUnprocessableEntityError,
  type ApiAnnuaireEducationNationaleRecord,
} from "#src/types";
import { isEmailValid } from "@gouvfr-lasuite/proconnect.core/security";
import { isEmpty } from "@gouvfr-lasuite/proconnect.core/utils/lodash";
import type { FetchOptions } from "openapi-fetch";

//

export function getAnnuaireEducationNationaleContactEmailFactory(
  client: OpendatasoftOpenApiClient,
  optionsFn: () => FetchOptions<unknown> = () => ({}),
) {
  return async function getAnnuaireEducationNationaleContactEmail(
    siret: string | null,
  ): Promise<string> {
    if (isEmpty(siret)) {
      throw new ApiOpendatasoftNotFoundError();
    }

    const { data, error } = await client.GET(
      "/catalog/datasets/{dataset_id}/records",
      {
        ...optionsFn(),
        params: {
          path: {
            dataset_id: "fr-en-annuaire-education",
          },
          query: {
            select: ["mail", "nom_etablissement"].join(", "),
            where: [`siren_siret = "${siret}"`].join(" and "),
          },
        },
      },
    );

    if (error) throw new ApiOpendatasoftConnectionError("", { cause: error });
    const results = data?.results;

    if (!results)
      throw new ApiOpendatasoftUnprocessableEntityError("Response malformed", {
        cause: data,
      });

    // We take the first établissement as every établissements are sharing the same SIRET.
    // We assume the first contact email is OK for every other établissements.
    const record = results.at(0) as ApiAnnuaireEducationNationaleRecord;
    if (isEmpty(record)) {
      throw new ApiOpendatasoftNotFoundError();
    }

    const { mail } = record;
    const formattedEmail = mail?.toLowerCase().trim();
    if (!isEmailValid(formattedEmail))
      throw new ApiOpendatasoftUnprocessableEntityError(
        `${formattedEmail} is not a valid email address.`,
      );

    return formattedEmail;
  };
}
