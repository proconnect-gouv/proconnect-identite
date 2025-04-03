//

import { findMandatairesSociauxBySirenFactory } from "@gouvfr-lasuite/proconnect.entreprise/api/infogreffe";
import {
  findBySirenFactory,
  findBySiretFactory,
} from "@gouvfr-lasuite/proconnect.entreprise/api/insee";
import {
  createEntrepriseOpenApiClient,
  type EntrepriseOpenApiClient,
} from "@gouvfr-lasuite/proconnect.entreprise/client";
import { getOrganizationInfoFactory } from "@gouvfr-lasuite/proconnect.identite/managers/organization";
import { TestingEntrepriseApiRouter } from "@gouvfr-lasuite/proconnect.testing/api/routes/entreprise.api.gouv.fr";
import {
  DEPLOY_ENV,
  ENTREPRISE_API_TOKEN,
  ENTREPRISE_API_TRACKING_CONTEXT,
  ENTREPRISE_API_TRACKING_RECIPIENT,
  ENTREPRISE_API_URL,
  HTTP_CLIENT_TIMEOUT,
} from "../config/env";

//

export const entrepriseOpenApiClient: EntrepriseOpenApiClient =
  createEntrepriseOpenApiClient(ENTREPRISE_API_TOKEN, {
    baseUrl: ENTREPRISE_API_URL,
    fetch:
      DEPLOY_ENV === "localhost" || DEPLOY_ENV === "preview"
        ? (input: Request) =>
            Promise.resolve(TestingEntrepriseApiRouter.fetch(input))
        : undefined,
  });

export const findBySiret = findBySiretFactory(
  entrepriseOpenApiClient,
  {
    context: ENTREPRISE_API_TRACKING_CONTEXT,
    object: "findEstablishmentBySiret",
    recipient: ENTREPRISE_API_TRACKING_RECIPIENT,
  },
  () => ({
    signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
  }),
);

export const findBySiren = findBySirenFactory(
  entrepriseOpenApiClient,
  {
    context: ENTREPRISE_API_TRACKING_CONTEXT,
    object: "findEstablishmentBySiren",
    recipient: ENTREPRISE_API_TRACKING_RECIPIENT,
  },
  () => ({
    signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
  }),
);

export const getOrganizationInfo = getOrganizationInfoFactory({
  findBySiren,
  findBySiret,
});

export const findMandatairesSociauxBySiren =
  findMandatairesSociauxBySirenFactory(
    entrepriseOpenApiClient,
    {
      context: ENTREPRISE_API_TRACKING_CONTEXT,
      object: "findMandatairesSociauxBySiren",
      recipient: ENTREPRISE_API_TRACKING_RECIPIENT,
    },
    () => ({
      signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
    }),
  );
