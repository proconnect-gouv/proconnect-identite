//

import type { RegistreNationalEntreprisesOpenApiClient } from "#src/client";
import { RegistreNationalEntreprisesApiError } from "#src/types";
import type { FetchOptions } from "openapi-fetch";

//

export function findBySirenFactory(
  client: RegistreNationalEntreprisesOpenApiClient,
  optionsFn: () => FetchOptions<unknown> = () => ({}),
) {
  return async function findBySiren(siren: string) {
    const { data, error } = await client.GET("/companies/{siren}", {
      ...optionsFn(),
      params: {
        path: {
          siren,
        },
      },
    });

    if (error) throw new RegistreNationalEntreprisesApiError(error);

    return data;
  };
}

export type FindBySirenHandler = ReturnType<typeof findBySirenFactory>;
