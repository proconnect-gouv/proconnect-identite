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

const inseeOpenApiClient: InseeSirenePrivateOpenApiClient =
  createInseeSirenePrivateOpenApiClient({
    baseUrl: INSEE_API_URL,
  });
inseeOpenApiClient.use({
  async onRequest({ request }) {
    const token = await getInseeAccessToken();
    request.headers.set("Authorization", `Bearer ${token}`);
    return new Request(request, {
      signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
    });
  },
});

const inseeOpenApiTestClient: InseeSirenePrivateOpenApiClient =
  createInseeSirenePrivateOpenApiClient({
    headers: { Authorization: "Bearer __INSEE_API_TOKEN__" },
    fetch: (input: Request) =>
      Promise.resolve(TestingInseeApiRouter.fetch(input)),
  });

const inseeClientOrigin = {
  findBySiren: findUniteLegaleBySirenFactory(inseeOpenApiClient),
  findBySiret: findUniteLegaleBySiretFactory(inseeOpenApiClient),
};
const inseeClientTest = {
  findBySiren: findUniteLegaleBySirenFactory(inseeOpenApiTestClient),
  findBySiret: findUniteLegaleBySiretFactory(inseeOpenApiTestClient),
};

export const InseeApiClient = {
  findBySiren(siren: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_INSEE_API_SIRENS.includes(siren)
        ? inseeClientTest
        : inseeClientOrigin;

    return client.findBySiren(siren);
  },
  findBySiret(siret: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_INSEE_API_SIRETS.includes(siret)
        ? inseeClientTest
        : inseeClientOrigin;

    return client.findBySiret(siret);
  },
};
