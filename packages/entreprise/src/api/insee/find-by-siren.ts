//

import type {
  ApiEntrepriseOpenApiClient,
  ApiEntrepriseTrackingParams,
} from "#src/client";
import { ApiEntrepriseError } from "#src/types";
import type { FetchOptions } from "openapi-fetch";

//

export function findBySirenFactory(
  client: ApiEntrepriseOpenApiClient,
  trackingParams: ApiEntrepriseTrackingParams,
  optionsFn: () => FetchOptions<unknown> = () => ({}),
) {
  return async function findBySiren(siren: string) {
    const { data, error } = await client.GET(
      "/v3/insee/sirene/unites_legales/{siren}/siege_social",
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

    if (error) throw new ApiEntrepriseError(error);

    const { data: establishment } = data;
    return establishment;
  };
}

export type FindBySirenHandler = ReturnType<typeof findBySirenFactory>;
