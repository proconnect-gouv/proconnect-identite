//

import {
  findUniteLegaleBySirenFactory,
  findUniteLegaleBySiretFactory,
  getInseeAccessTokenFactory,
} from "@proconnect-gouv/proconnect.insee/api";
import {
  createInseeSirenePrivateOpenApiClient,
  type InseeSirenePrivateOpenApiClient,
} from "@proconnect-gouv/proconnect.insee/client";
import { TestingInseeApiRouter } from "@proconnect-gouv/proconnect.testing/api/routes/api.insee.fr";
import {
  TESTING_INSEE_API_SIRENS,
  TESTING_INSEE_API_SIRETS,
} from "@proconnect-gouv/proconnect.testing/api/routes/api.insee.fr/etablissements";
import {
  FEATURE_PARTIALLY_MOCK_EXTERNAL_API,
  HTTP_CLIENT_TIMEOUT,
  INSEE_API_CLIENT_ID,
  INSEE_API_CLIENT_SECRET,
  INSEE_API_PASSWORD,
  INSEE_API_URL,
  INSEE_API_USERNAME,
} from "../config/env";

//

const getInseeAccessToken = getInseeAccessTokenFactory({
  client_id: INSEE_API_CLIENT_ID,
  client_secret: INSEE_API_CLIENT_SECRET,
  grant_type: "password",
  password: INSEE_API_PASSWORD,
  username: INSEE_API_USERNAME,
});

async function getInseeOpenApiClient() {
  const token = await getInseeAccessToken();
  return createInseeSirenePrivateOpenApiClient(token, {
    baseUrl: INSEE_API_URL,
  });
}

const inseeOpenApiTestClient: InseeSirenePrivateOpenApiClient =
  createInseeSirenePrivateOpenApiClient("__INSEE_API_TOKEN__", {
    fetch: (input: Request) =>
      Promise.resolve(TestingInseeApiRouter.fetch(input)),
  });

export const InseeApiRepository = {
  async findBySiren(siren: string) {
    const client: InseeSirenePrivateOpenApiClient =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_INSEE_API_SIRENS.includes(siren)
        ? inseeOpenApiTestClient
        : await getInseeOpenApiClient();

    return findUniteLegaleBySirenFactory(client, () => ({
      signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
    }))(siren);
  },
  async findBySiret(siret: string) {
    const client: InseeSirenePrivateOpenApiClient =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_INSEE_API_SIRETS.includes(siret)
        ? inseeOpenApiTestClient
        : await getInseeOpenApiClient();

    return findUniteLegaleBySiretFactory(client, () => ({
      signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
    }))(siret);
  },
};
