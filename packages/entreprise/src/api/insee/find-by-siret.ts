//

import type {
  ApiEntrepriseOpenApiClient,
  ApiEntrepriseTrackingParams,
} from "#src/client";
import { ApiEntrepriseError } from "#src/types";

//

export function findBySiretFactory(
  client: ApiEntrepriseOpenApiClient,
  trackingParams: ApiEntrepriseTrackingParams,
) {
  return async function findBySiret(siret: string) {
    const { data, error } = await client.GET(
      "/v3/insee/sirene/etablissements/{siret}",
      {
        params: {
          path: {
            siret,
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

export type FindBySiretHandler = ReturnType<typeof findBySiretFactory>;
