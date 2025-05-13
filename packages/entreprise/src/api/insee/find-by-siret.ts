//

import type {
  EntrepriseApiTrackingParams,
  EntrepriseOpenApiClient,
} from "#src/client";
import { EntrepriseApiError } from "#src/types";
import type { FetchOptions } from "openapi-fetch";

//

export function findBySiretFactory(
  client: EntrepriseOpenApiClient,
  trackingParams: EntrepriseApiTrackingParams,
  optionsFn: () => FetchOptions<unknown> = () => ({}),
) {
  return async function findBySiret(siret: string) {
    const { data, error } = await client.GET(
      "/v3/insee/sirene/etablissements/{siret}",
      {
        ...optionsFn(),
        params: {
          path: {
            siret,
          },
          query: trackingParams,
        },
      },
    );

    if (error) throw new EntrepriseApiError(error);

    const { data: establishment } = data;
    return establishment;
  };
}

export type FindBySiretHandler = ReturnType<typeof findBySiretFactory>;
