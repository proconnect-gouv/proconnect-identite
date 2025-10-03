//

import type {
  EntrepriseApiTrackingParams,
  EntrepriseOpenApiClient,
} from "#src/client";
import { EntrepriseApiError } from "#src/types";
import type { FetchOptions } from "openapi-fetch";

//

export function findMandatairesSociauxBySirenFactory(
  client: EntrepriseOpenApiClient,
  trackingParams: EntrepriseApiTrackingParams,
  optionsFn: () => FetchOptions<unknown> = () => ({}),
) {
  return async function findMandatairesSociauxBySiren(siren: string) {
    const { data, error } = await client.GET(
      "/v3/infogreffe/rcs/unites_legales/{siren}/mandataires_sociaux",
      {
        ...optionsFn(),
        params: {
          path: {
            siren,
          },
          query: trackingParams,
        },
      },
    );

    if (error) throw new EntrepriseApiError(error);

    const { data: peoples } = data;

    return peoples.map(({ data }) => data).filter((data) => !!data);
  };
}

export type FindMandatairesSociauxBySirenHandler = ReturnType<
  typeof findMandatairesSociauxBySirenFactory
>;
