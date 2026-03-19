//

import type { InseeSirenePrivateOpenApiClient } from "#src/client";
import { InseeApiError } from "#src/types";

//

export function findUniteLegaleBySirenFactory(
  client: InseeSirenePrivateOpenApiClient,
) {
  return async function findUniteLegaleBySiren(siren: string) {
    const { data, error } = await client.GET("/siren/{siren}", {
      params: {
        path: {
          siren,
        },
      },
    });

    if (error) throw new InseeApiError(error);
    if (!data)
      throw new InseeApiError({
        header: { statut: 404, message: "Not Data" },
      });

    if (!data.uniteLegale)
      throw new InseeApiError({
        header: { statut: 404, message: "Not unite legale" },
      });

    const nomUniteLegale = data.uniteLegale.periodesUniteLegale?.find(
      (periode) => periode.dateFin === null,
    )?.nomUniteLegale;

    if (!nomUniteLegale)
      throw new InseeApiError({
        header: {
          statut: 409,
          message: "Not active periode with nomUniteLegale",
        },
      });

    return data.uniteLegale;
  };
}

export type FindUniteLegaleBySirenHandler = ReturnType<
  typeof findUniteLegaleBySirenFactory
>;
