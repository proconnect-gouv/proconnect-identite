//

import { createApiEntrepriseClient } from "@proconnect-gouv/proconnect.api_entreprise/api";
import {
  createApiEntrepriseOpenApiClient,
  type ApiEntrepriseOpenApiClient,
} from "@proconnect-gouv/proconnect.api_entreprise/client";
import { TestingApiEntrepriseRouter } from "@proconnect-gouv/proconnect.testing/api/routes/entreprise.api.gouv.fr";
import { TESTING_ENTREPRISE_API_SIRETS } from "@proconnect-gouv/proconnect.testing/api/routes/entreprise.api.gouv.fr/etablissements";
import { TESTING_ENTREPRISE_API_MANDATAIRES_SIREN } from "@proconnect-gouv/proconnect.testing/api/routes/entreprise.api.gouv.fr/mandataires_sociaux";
import {
  ENTREPRISE_API_TOKEN,
  ENTREPRISE_API_TRACKING_CONTEXT,
  ENTREPRISE_API_TRACKING_RECIPIENT,
  ENTREPRISE_API_URL,
  FEATURE_PARTIALLY_MOCK_EXTERNAL_API,
  HTTP_CLIENT_TIMEOUT,
} from "../config/env";

//

const apiEntrepriseOpenApiClient = createApiEntrepriseOpenApiClient(
  ENTREPRISE_API_TOKEN,
  {
    baseUrl: ENTREPRISE_API_URL,
  },
);
apiEntrepriseOpenApiClient.use({
  onRequest({ request }) {
    return new Request(request, {
      signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
    });
  },
});

//

export const apiEntrepriseOpenApiTestClient: ApiEntrepriseOpenApiClient =
  createApiEntrepriseOpenApiClient("__ENTREPRISE_API_TOKEN__", {
    fetch: (input: Request) =>
      Promise.resolve(TestingApiEntrepriseRouter.fetch(input)),
  });

//

const ApiEntreprise = createApiEntrepriseClient(
  apiEntrepriseOpenApiClient,
  ENTREPRISE_API_TRACKING_CONTEXT,
  ENTREPRISE_API_TRACKING_RECIPIENT,
);
const ApiEntrepriseTest = createApiEntrepriseClient(
  apiEntrepriseOpenApiTestClient,
  ENTREPRISE_API_TRACKING_CONTEXT,
  ENTREPRISE_API_TRACKING_RECIPIENT,
);

//

export const ApiEntrepriseClient = {
  findBySiren(siren: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_ENTREPRISE_API_SIRETS.map((siret) =>
        siret.substring(0, 9),
      ).includes(siren)
        ? ApiEntrepriseTest
        : ApiEntreprise;

    return client.findBySiren(siren);
  },
  findBySiret(siret: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_ENTREPRISE_API_SIRETS.includes(siret)
        ? ApiEntrepriseTest
        : ApiEntreprise;

    return client.findBySiret(siret);
  },
  findMandatairesSociauxBySiren(siren: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_ENTREPRISE_API_MANDATAIRES_SIREN.includes(siren)
        ? ApiEntrepriseTest
        : ApiEntreprise;

    return client.findMandatairesSociauxBySiren(siren);
  },
};
