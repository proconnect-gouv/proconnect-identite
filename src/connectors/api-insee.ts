//

import {
  createApiInseeClient,
  getInseeAccessTokenFactory,
} from "@proconnect-gouv/proconnect.insee/api";
import { createInseeSirenePrivateOpenApiClient } from "@proconnect-gouv/proconnect.insee/client";
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
const inseeOpenApiClient = createInseeSirenePrivateOpenApiClient({
  baseUrl: INSEE_API_URL,
});
inseeOpenApiClient.use({
  async onRequest({ request }) {
    return new Request(request, {
      signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
    });
  },
});

//

const inseeOpenApiTestClient = createInseeSirenePrivateOpenApiClient({
  fetch: (input: Request) =>
    Promise.resolve(TestingInseeApiRouter.fetch(input)),
});

//

const ApiInsee = createApiInseeClient(inseeOpenApiClient, getInseeAccessToken);
const ApiInseeTest = createApiInseeClient(inseeOpenApiTestClient, () =>
  Promise.resolve("__INSEE_API_TOKEN__"),
);

//

export const ApiInseeClient = {
  findBySiren(siren: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_INSEE_API_SIRENS.includes(siren)
        ? ApiInseeTest
        : ApiInsee;

    return client.findBySiren(siren);
  },
  findBySiret(siret: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_INSEE_API_SIRETS.includes(siret)
        ? ApiInseeTest
        : ApiInsee;

    return client.findBySiret(siret);
  },
};
