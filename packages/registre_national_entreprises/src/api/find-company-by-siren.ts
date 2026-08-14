//

import type { RegistreNationalEntreprisesOpenApiClient } from "#src/client";
import { RegistreNationalEntreprisesApiError } from "#src/types";

//

export function findCompanyBySirenFactory(
  client: RegistreNationalEntreprisesOpenApiClient,
) {
  return async function findCompanyBySiren(siren: string) {
    const { data, error } = await client.GET("/companies/{siren}", {
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
