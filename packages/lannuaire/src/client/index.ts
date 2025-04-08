//

import type { paths } from "#openapi";
import createClient, { type ClientOptions } from "openapi-fetch";

//

/**
 * Create an Annuaire Service Public client
 * @see https://help.opendatasoft.com/apis/ods-explore-v2/explore_v2.1.html
 * @param options - the client options
 * @note `options.baseUrl` is "https://api-lannuaire.service-public.fr" by default
 * @returns the client
 */
export function createAnnuaireOpenApiClient(options: ClientOptions = {}) {
  return createClient<paths>({
    baseUrl: options.baseUrl ?? "https://api-lannuaire.service-public.fr",
    ...options,
  });
}

export type AnnuaireOpenApiClient = ReturnType<
  typeof createAnnuaireOpenApiClient
>;
