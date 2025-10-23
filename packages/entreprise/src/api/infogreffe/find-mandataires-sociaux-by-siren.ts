//

import type {
  ApiEntrepriseOpenApiClient,
  ApiEntrepriseTrackingParams,
} from "#src/client";
import { ApiEntrepriseError } from "#src/types";
import type { FetchOptions } from "openapi-fetch";

//

export function findMandatairesSociauxBySirenFactory(
  client: ApiEntrepriseOpenApiClient,
  trackingParams: ApiEntrepriseTrackingParams,
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

    if (error) throw new ApiEntrepriseError(error);

    const { data: peoples } = data;

    return peoples
      .map(({ data }) => data)
      .filter((data) => !!data)
      .filter((data) => data.type === "personne_physique");
  };
}

export type FindMandatairesSociauxBySirenHandler = ReturnType<
  typeof findMandatairesSociauxBySirenFactory
>;
