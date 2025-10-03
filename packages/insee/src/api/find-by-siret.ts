//

import type { InseeSirenePrivateOpenApiClient } from "#src/client";
import { InseeApiError } from "#src/types";
import type { FetchOptions } from "openapi-fetch";

//

export function findBySiretFactory(
  client: InseeSirenePrivateOpenApiClient,
  optionsFn: () => FetchOptions<unknown> = () => ({}),
) {
  return async function findBySiret(siret: string) {
    const { data, error } = await client.GET("/siret/{siret}", {
      ...optionsFn(),
      params: {
        path: {
          siret,
        },
      },
    });

    if (error) throw new InseeApiError(error);
    if (!data)
      throw new InseeApiError({
        header: { statut: 404, message: "Not Data" },
      });

    if (data.header?.statut !== 200 || !data.etablissement)
      throw new InseeApiError(data);

    return data.etablissement;
  };
}

export type FindBySiretHandler = ReturnType<typeof findBySiretFactory>;
