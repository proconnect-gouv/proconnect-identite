import * as InseeApi from "@gouvfr-lasuite/proconnect.insee/api";
import { createInseeSirenePrivateOpenApiClient } from "@gouvfr-lasuite/proconnect.insee/client";
import { TestingInseeApiRouter } from "@gouvfr-lasuite/proconnect.testing/api/routes/api.insee.fr";
import {
  DEPLOY_ENV,
  HTTP_CLIENT_TIMEOUT,
  INSEE_API_CLIENT_ID,
  INSEE_API_CLIENT_SECRET,
  INSEE_API_PASSWORD,
  INSEE_API_URL,
  INSEE_API_USERNAME,
} from "../config/env";

const getInseeAccessToken =
  DEPLOY_ENV === "localhost"
    ? () => Promise.resolve("__INSEE_ACCESS_TOKEN__")
    : InseeApi.getInseeAccessTokenFactory({
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
    fetch:
      DEPLOY_ENV === "localhost"
        ? (input: Request) =>
            Promise.resolve(TestingInseeApiRouter.fetch(input))
        : undefined,
  });
}

export const InseeApiRepository = {
  async findBySiret(siret: string) {
    const inseeOpenApiClient = await getInseeOpenApiClient();
    return InseeApi.findBySiretFactory(inseeOpenApiClient, () => ({
      signal: AbortSignal.timeout(HTTP_CLIENT_TIMEOUT),
    }))(siret);
  },
};
