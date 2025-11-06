//

import { findMandatairesSociauxBySirenFactory } from "@proconnect-gouv/proconnect.api_entreprise/api/infogreffe";
import {
  findBySirenFactory,
  findBySiretFactory,
} from "@proconnect-gouv/proconnect.api_entreprise/api/insee";
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

export const apiEntrepriseOpenApiClient: ApiEntrepriseOpenApiClient =
  createApiEntrepriseOpenApiClient(ENTREPRISE_API_TOKEN, {
    baseUrl: ENTREPRISE_API_URL,
  });

export const apiEntrepriseOpenApiTestClient: ApiEntrepriseOpenApiClient =
  createApiEntrepriseOpenApiClient("__ENTREPRISE_API_TOKEN__", {
    fetch: (input: Request) =>
      Promise.resolve(TestingApiEntrepriseRouter.fetch(input)),
  });

export const ApiEntrepriseInfogreffeRepository = {
  findMandatairesSociauxBySiren(siren: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_ENTREPRISE_API_MANDATAIRES_SIREN.includes(siren)
        ? apiEntrepriseOpenApiTestClient
        : apiEntrepriseOpenApiClient;

    return findMandatairesSociauxBySirenFactory(
      client,
      {
        context: ENTREPRISE_API_TRACKING_CONTEXT,
        object: "findMandatairesSociauxBySiren",
        recipient: ENTREPRISE_API_TRACKING_RECIPIENT,
      },
      () => ({
        signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
      }),
    )(siren);
  },
};

export const ApiEntrepriseInseeRepository = {
  findBySiren(siren: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_ENTREPRISE_API_SIRETS.map((siret) =>
        siret.substring(0, 9),
      ).includes(siren)
        ? apiEntrepriseOpenApiTestClient
        : apiEntrepriseOpenApiClient;

    return findBySirenFactory(
      client,
      {
        context: ENTREPRISE_API_TRACKING_CONTEXT,
        object: "findEstablishmentBySiren",
        recipient: ENTREPRISE_API_TRACKING_RECIPIENT,
      },
      () => ({
        signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
      }),
    )(siren);
  },
  findBySiret(siret: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_ENTREPRISE_API_SIRETS.includes(siret)
        ? apiEntrepriseOpenApiTestClient
        : apiEntrepriseOpenApiClient;

    return findBySiretFactory(
      client,
      {
        context: ENTREPRISE_API_TRACKING_CONTEXT,
        object: "findEstablishmentBySiret",
        recipient: ENTREPRISE_API_TRACKING_RECIPIENT,
      },
      () => ({
        signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
      }),
    )(siret);
  },
};
