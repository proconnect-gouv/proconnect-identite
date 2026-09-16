//

import type { RegistreNationalEntreprisesOpenApiClient } from "#src/client";
import { findCompanyBySirenFactory } from "./find-company-by-siren.js";
import { findPouvoirsBySirenFactory } from "./find-pouvoirs-by-siren.js";
import type { GetRegistreNationalEntreprisesAccessTokenHandler } from "./get-rne-access-token.js";

export type { FindPouvoirsBySirenHandler } from "./find-pouvoirs-by-siren.js";
export * from "./get-rne-access-token.js";

//

export function createRegistreNationalEntreprisesClient(
  client: RegistreNationalEntreprisesOpenApiClient,
  getAuthorizationToken: GetRegistreNationalEntreprisesAccessTokenHandler,
) {
  client.use({
    async onRequest({ request }) {
      const token = await getAuthorizationToken();
      request.headers.set("Authorization", `Bearer ${token}`);
      return request;
    },
  });
  return {
    findPouvoirsBySiren: findPouvoirsBySirenFactory(client),
    findCompanyBySiren: findCompanyBySirenFactory(client),
  };
}

export type ApiRegistreNationalEntreprisesClient = ReturnType<
  typeof createRegistreNationalEntreprisesClient
>;
