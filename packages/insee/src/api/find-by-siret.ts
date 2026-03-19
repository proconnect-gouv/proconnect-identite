//

import type { InseeSirenePrivateOpenApiClient } from "#src/client";
import { InseeApiError } from "#src/types";

//

export function findUniteLegaleBySiretFactory(
  client: InseeSirenePrivateOpenApiClient,
) {
  return async function findUniteLegaleBySiret(siret: string) {
    const { data, error } = await client.GET("/siret/{siret}", {
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

    if (!data.etablissement.uniteLegale)
      throw new InseeApiError({
        header: { statut: 404, message: "Not unite legale" },
      });

    return data.etablissement.uniteLegale;
  };
}

export type FindUniteLegaleBySiretHandler = ReturnType<
  typeof findUniteLegaleBySiretFactory
>;
