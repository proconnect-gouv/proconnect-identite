//

import type { RegistreNationalEntreprisesOpenApiClient } from "#src/client";
import { RegistreNationalEntreprisesApiError } from "#src/types";
import type { FetchOptions } from "openapi-fetch";

//

export function findPouvoirsBySirenFactory(
  client: RegistreNationalEntreprisesOpenApiClient,
  optionsFn: () => FetchOptions<unknown> = () => ({}),
) {
  return async function findPouvoirsBySiren(siren: string) {
    const { data, error } = await client.GET("/companies/{siren}", {
      ...optionsFn(),
      params: {
        path: {
          siren,
        },
      },
    });

    if (error) throw new RegistreNationalEntreprisesApiError(error);

    return (
      data.formality?.content?.personneMorale?.composition?.pouvoirs ?? []
    ).filter(
      (pouvoir) =>
        pouvoir.typeDePersonne === "INDIVIDU" &&
        pouvoir.actif === true &&
        pouvoir.individu !== undefined,
    );
  };
}

export type FindPouvoirsBySirenHandler = ReturnType<
  typeof findPouvoirsBySirenFactory
>;
