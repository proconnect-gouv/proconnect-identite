//

import {
  createRegistreNationalEntreprisesClient,
  getRegistreNationalEntreprisesAccessTokenFactory,
} from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { createRegistreNationalEntreprisesOpenApiClient } from "@proconnect-gouv/proconnect.registre_national_entreprises/client";
import {
  FEATURE_USE_MOCK_TOKEN_FOR_RNE_API_CALLS,
  RNE_API_BASE_URL,
  RNE_API_HTTP_CLIENT_TIMEOUT,
  RNE_API_PASSWORD,
  RNE_API_USERNAME,
} from "../config/env";

//

const getRneToken = getRegistreNationalEntreprisesAccessTokenFactory({
  password: RNE_API_PASSWORD,
  username: RNE_API_USERNAME,
});
const mockGetRneToken = () => Promise.resolve("__RNE_API_TOKEN__");
const rneClient = createRegistreNationalEntreprisesOpenApiClient({
  baseUrl: RNE_API_BASE_URL,
});
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

// const rneOpenApiTestClient: RegistreNationalEntreprisesOpenApiClient =
//   createRegistreNationalEntreprisesOpenApiClient({
//     fetch: (input: Request) =>
//       Promise.resolve(
//         TestingRegistreNationalEntreprisesOpenApiRouter.fetch(input),
//       ),
//   });

export const RegistreNationalEntreprisesTestClient =
  createRegistreNationalEntreprisesClient(rneClient, mockGetRneToken);

//

export const ApiRegistreNationalEntreprisesClient = {
  async findPouvoirsBySiren(siren: string) {
    const client = FEATURE_USE_MOCK_TOKEN_FOR_RNE_API_CALLS
      ? RegistreNationalEntreprisesTestClient
      : RegistreNationalEntreprisesClient;
    return client.findPouvoirsBySiren(siren);
  },
  async findCompanyBySiren(siren: string) {
    const client = FEATURE_USE_MOCK_TOKEN_FOR_RNE_API_CALLS
      ? RegistreNationalEntreprisesTestClient
      : RegistreNationalEntreprisesClient;
    return client.findCompanyBySiren(siren);
  },
};
