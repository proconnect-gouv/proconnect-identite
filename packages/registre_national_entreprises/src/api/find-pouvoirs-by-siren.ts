//

import type { RegistreNationalEntreprisesOpenApiClient } from "#src/client";
import { RegistreNationalEntreprisesApiError } from "#src/types";

//

export function findPouvoirsBySirenFactory(
  client: RegistreNationalEntreprisesOpenApiClient,
) {
  return async function findPouvoirsBySiren(siren: string) {
    const { data, error } = await client.GET("/companies/{siren}", {
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
        (pouvoir.actif === undefined || pouvoir.actif === true) &&
        pouvoir.individu !== undefined,
    );
  };
}

export type FindPouvoirsBySirenHandler = ReturnType<
  typeof findPouvoirsBySirenFactory
>;
