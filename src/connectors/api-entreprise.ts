//

import {
  createApiEntrepriseInfogreffeRepository,
  createApiEntrepriseInseeRepository,
} from "@proconnect-gouv/proconnect.api_entreprise/api";
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

const apiEntrepriseOpenApiClient: ApiEntrepriseOpenApiClient =
  createApiEntrepriseOpenApiClient(ENTREPRISE_API_TOKEN, {
    baseUrl: ENTREPRISE_API_URL,
  });

export const apiEntrepriseOpenApiTestClient: ApiEntrepriseOpenApiClient =
  createApiEntrepriseOpenApiClient("__ENTREPRISE_API_TOKEN__", {
    fetch: (input: Request) =>
      Promise.resolve(TestingApiEntrepriseRouter.fetch(input)),
  });

const ApiEntrepriseInfogreffeRepositoryOrigin =
  createApiEntrepriseInfogreffeRepository(
    apiEntrepriseOpenApiClient,
    ENTREPRISE_API_TRACKING_CONTEXT,
    ENTREPRISE_API_TRACKING_RECIPIENT,
    () => ({
      signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
    }),
  );
const ApiEntrepriseInfogreffeRepositoryTest =
  createApiEntrepriseInfogreffeRepository(
    apiEntrepriseOpenApiTestClient,
    ENTREPRISE_API_TRACKING_CONTEXT,
    ENTREPRISE_API_TRACKING_RECIPIENT,
    () => ({
      signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
    }),
  );

export const ApiEntrepriseInfogreffeRepository = {
  findMandatairesSociauxBySiren(siren: string) {
    const repo =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_ENTREPRISE_API_MANDATAIRES_SIREN.includes(siren)
        ? ApiEntrepriseInfogreffeRepositoryTest
        : ApiEntrepriseInfogreffeRepositoryOrigin;

    return repo.findMandatairesSociauxBySiren(siren);
  },
};

//

const ApiEntrepriseInseeRepositoryOrigin = createApiEntrepriseInseeRepository(
  apiEntrepriseOpenApiClient,
  ENTREPRISE_API_TRACKING_CONTEXT,
  ENTREPRISE_API_TRACKING_RECIPIENT,
  () => ({
    signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
  }),
);
const ApiEntrepriseInseeRepositoryTest = createApiEntrepriseInseeRepository(
  apiEntrepriseOpenApiTestClient,
  ENTREPRISE_API_TRACKING_CONTEXT,
  ENTREPRISE_API_TRACKING_RECIPIENT,
  () => ({
    signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
  }),
);

export const ApiEntrepriseInseeRepository = {
  findBySiren(siren: string) {
    const repo =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_ENTREPRISE_API_SIRETS.map((siret) =>
        siret.substring(0, 9),
      ).includes(siren)
        ? ApiEntrepriseInseeRepositoryTest
        : ApiEntrepriseInseeRepositoryOrigin;

    return repo.findBySiren(siren);
  },
  findBySiret(siret: string) {
    const repo =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_ENTREPRISE_API_SIRETS.includes(siret)
        ? ApiEntrepriseInseeRepositoryTest
        : ApiEntrepriseInseeRepositoryOrigin;

    return repo.findBySiret(siret);
  },
};
