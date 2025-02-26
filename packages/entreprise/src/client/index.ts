//

import type { paths } from "#openapi";
import createClient, { type ClientOptions } from "openapi-fetch";

//

/**
 * @see https://entreprise.api.gouv.fr/developpeurs#renseigner-les-param%C3%A8tres-dappel-et-de-tra%C3%A7abilit%C3%A9
 */
export interface EntrepriseApiTrackingParams {
  recipient: string;
  context: string;
  object: string;
}

//

/**
 * Create an Entreprise openapi-fetch client
 * @see https://openapi-ts.dev/openapi-fetch/api#createclient
 * @param token - the https://entreprise.api.gouv.fr token
 * @param options - the client options
 * @note `options.baseUrl` is "https://entreprise.api.gouv.fr/" by default
 * @returns the client
 */
export function createEntrepriseOpenApiClient(
  token: string,
  options: ClientOptions = {},
) {
  return createClient<paths>({
    baseUrl: options.baseUrl ?? "https://entreprise.api.gouv.fr/",
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });
}

export type EntrepriseOpenApiClient = ReturnType<
  typeof createEntrepriseOpenApiClient
>;
