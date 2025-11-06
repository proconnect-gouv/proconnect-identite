//

import {
  findBeneficiairesEffectifsBySirenFactory,
  getRegistreNationalEntreprisesAccessTokenFactory,
} from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { createRegistreNationalEntreprisesOpenApiClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/client";
import { TestingRegistreNationalEntreprisesOpenApiRouter } from "@proconnect-gouv/proconnect.testing/api/routes/registre-national-entreprises.inpi.fr";
import { TESTING_RNE_API_SIRENS } from "@proconnect-gouv/proconnect.testing/api/routes/registre-national-entreprises.inpi.fr/companies";
import {
  FEATURE_PARTIALLY_MOCK_EXTERNAL_API,
  RNE_API_HTTP_CLIENT_TIMEOUT,
  RNE_API_PASSWORD,
  RNE_API_USERNAME,
} from "../config/env";

//

const rneOpenApiTestClient = createRegistreNationalEntreprisesOpenApiClient(
  "__RNE_API_TOKEN__",
  {
    fetch: (input: Request) =>
      Promise.resolve(
        TestingRegistreNationalEntreprisesOpenApiRouter.fetch(input),
      ),
  },
);

export const RegistreNationalEntreprisesApiRepository = {
  async findBeneficiairesEffectifsBySiren(siren: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_RNE_API_SIRENS.includes(siren)
        ? rneOpenApiTestClient
        : await get_client();
    return findBeneficiairesEffectifsBySirenFactory(client, () => ({
      signal: AbortSignal.timeout(RNE_API_HTTP_CLIENT_TIMEOUT),
    }))(siren);
  },
};

//

const get_access_token = getRegistreNationalEntreprisesAccessTokenFactory({
  password: RNE_API_PASSWORD,
  username: RNE_API_USERNAME,
});

async function get_client() {
  const token = await get_access_token();
  return createRegistreNationalEntreprisesOpenApiClient(token);
}
