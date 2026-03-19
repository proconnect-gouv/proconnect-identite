//

import {
  createRegistreNationalEntreprisesClient,
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

const getRneToken = getRegistreNationalEntreprisesAccessTokenFactory({
  password: RNE_API_PASSWORD,
  username: RNE_API_USERNAME,
});
const rneClient = createRegistreNationalEntreprisesOpenApiClient();
rneClient.use({
  async onRequest({ request }) {
    return new Request(request, {
      signal: AbortSignal.timeout(RNE_API_HTTP_CLIENT_TIMEOUT),
    });
  },
});

const RegistreNationalEntreprisesClient =
  createRegistreNationalEntreprisesClient(rneClient, getRneToken);

//

const rneTestClient = createRegistreNationalEntreprisesOpenApiClient({
  fetch: (input: Request) =>
    Promise.resolve(
      TestingRegistreNationalEntreprisesOpenApiRouter.fetch(input),
    ),
});

const RegistreNationalEntreprisesTestClient =
  createRegistreNationalEntreprisesClient(rneTestClient, () =>
    Promise.resolve("__RNE_API_TOKEN__"),
  );

//

export const RegistreNationalEntreprisesApiClient = {
  async findPouvoirsBySiren(siren: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_RNE_API_SIRENS.includes(siren)
        ? RegistreNationalEntreprisesTestClient
        : RegistreNationalEntreprisesClient;
    return client.findPouvoirsBySiren(siren);
  },
};
