//

import type { paths } from "#openapi";
import createClient, { type ClientOptions } from "openapi-fetch";

//

/**
 * Create an Registre National des Entreprises API client
 * @see https://registre-national-entreprises.inpi.fr/api
 * @param options - the client options
 * @note `options.baseUrl` is "https://registre-national-entreprises.inpi.fr/api by default
 * @returns the client
 */
export function createRegistreNationalEntreprisesOpenApiClient(
  token: string,
  options: ClientOptions = {},
) {
  return createClient<paths>({
    baseUrl:
      options.baseUrl ?? "https://registre-national-entreprises.inpi.fr/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });
}

export type RegistreNationalEntreprisesOpenApiClient = ReturnType<
  typeof createRegistreNationalEntreprisesOpenApiClient
>;

//
