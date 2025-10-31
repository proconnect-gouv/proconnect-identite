//

import type { RegistreNationalEntreprisesOpenApiClient } from "#src/client";
import { RegistreNationalEntreprisesApiError } from "#src/types";
import type { FetchOptions } from "openapi-fetch";

//

export function findBeneficiairesEffectifsBySirenFactory(
  client: RegistreNationalEntreprisesOpenApiClient,
  optionsFn: () => FetchOptions<unknown> = () => ({}),
) {
  return async function findBeneficiairesEffectifsBySiren(siren: string) {
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
      data.formality?.content?.personneMorale?.beneficiairesEffectifs ?? []
    )
      .map(({ beneficiaire }) => beneficiaire)
      .filter((beneficiaire) => beneficiaire !== undefined);
  };
}

export type FindBeneficiairesEffectifsBySirenHandler = ReturnType<
  typeof findBeneficiairesEffectifsBySirenFactory
>;
