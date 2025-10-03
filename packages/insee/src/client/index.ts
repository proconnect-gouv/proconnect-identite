//

import type { paths } from "#openapi";
import createClient, { type ClientOptions } from "openapi-fetch";

//

/**
 * Create an INSEE OpenAPI client
 * @see https://portail-api.insee.fr
 * @param options - the client options
 * @note `options.baseUrl` is "https://api.insee.fr/api-sirene/prive/3.11" by default
 * @returns the client
 */
export function createInseeSirenePrivateOpenApiClient(
  token: string,
  options: ClientOptions = {},
) {
  return createClient<paths>({
    baseUrl: options.baseUrl ?? "https://api.insee.fr/api-sirene/prive/3.11",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });
}

export type InseeSirenePrivateOpenApiClient = ReturnType<
  typeof createInseeSirenePrivateOpenApiClient
>;

//
