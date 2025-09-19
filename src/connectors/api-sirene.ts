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
import * as InseeApi from "@gouvfr-lasuite/proconnect.insee/api";
import {
  createInseeSirenePrivateOpenApiClient,
  type InseeSirenePrivateOpenApiClient,
} from "@gouvfr-lasuite/proconnect.insee/client";
import { TestingInseeApiRouter } from "@gouvfr-lasuite/proconnect.testing/api/routes/api.insee.fr";
import { TESTING_INSEE_API_SIRETS } from "@gouvfr-lasuite/proconnect.testing/api/routes/api.insee.fr/etablissements";
import { TestingEntrepriseApiRouter } from "@gouvfr-lasuite/proconnect.testing/api/routes/entreprise.api.gouv.fr";
import { TESTING_ENTREPRISE_API_SIRETS } from "@gouvfr-lasuite/proconnect.testing/api/routes/entreprise.api.gouv.fr/etablissements";
import { TESTING_ENTREPRISE_API_MANDATAIRES_SIREN } from "@gouvfr-lasuite/proconnect.testing/api/routes/entreprise.api.gouv.fr/mandataires_sociaux";
import {
  ENTREPRISE_API_TOKEN,
  ENTREPRISE_API_TRACKING_CONTEXT,
  ENTREPRISE_API_TRACKING_RECIPIENT,
  ENTREPRISE_API_URL,
  FEATURE_PARTIALLY_MOCK_EXTERNAL_API,
  HTTP_CLIENT_TIMEOUT,
  INSEE_API_CLIENT_ID,
  INSEE_API_CLIENT_SECRET,
  INSEE_API_PASSWORD,
  INSEE_API_URL,
  INSEE_API_USERNAME,
} from "../config/env";

//

export const entrepriseOpenApiClient: EntrepriseOpenApiClient =
  createEntrepriseOpenApiClient(ENTREPRISE_API_TOKEN, {
    baseUrl: ENTREPRISE_API_URL,
  });

export const entrepriseOpenApiTestClient: EntrepriseOpenApiClient =
  createEntrepriseOpenApiClient("__ENTREPRISE_API_TOKEN__", {
    fetch: (input: Request) =>
      Promise.resolve(TestingEntrepriseApiRouter.fetch(input)),
  });

export const EntrepriseApiInfogreffeRepository = {
  findMandatairesSociauxBySiren(siren: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_ENTREPRISE_API_MANDATAIRES_SIREN.includes(siren)
        ? entrepriseOpenApiTestClient
        : entrepriseOpenApiClient;

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

export const EntrepriseApiInseeRepository = {
  findBySiren(siren: string) {
    const client =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_ENTREPRISE_API_SIRETS.map((siret) =>
        siret.substring(0, 9),
      ).includes(siren)
        ? entrepriseOpenApiTestClient
        : entrepriseOpenApiClient;

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
        ? entrepriseOpenApiTestClient
        : entrepriseOpenApiClient;

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

const getInseeAccessToken = InseeApi.getInseeAccessTokenFactory({
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
  async findBySiret(siret: string) {
    const client: InseeSirenePrivateOpenApiClient =
      FEATURE_PARTIALLY_MOCK_EXTERNAL_API &&
      TESTING_INSEE_API_SIRETS.includes(siret)
        ? inseeOpenApiTestClient
        : await getInseeOpenApiClient();

    return InseeApi.findBySiretFactory(client, () => ({
      signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
    }))(siret);
  },
};

export const getOrganizationInfo = getOrganizationInfoFactory({
  findBySiren: EntrepriseApiInseeRepository.findBySiren,
  findBySiret: EntrepriseApiInseeRepository.findBySiret,
});
