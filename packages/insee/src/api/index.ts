//

import type { InseeSirenePrivateOpenApiClient } from "#src/client";
import { findUniteLegaleBySirenFactory } from "./find-by-siren.js";
import { findUniteLegaleBySiretFactory } from "./find-by-siret.js";

export * from "./get-insee-access-token.js";

export function createApiInseeClient(
  client: InseeSirenePrivateOpenApiClient,
  getAuthorizationToken: () => Promise<string>,
) {
  client.use({
    async onRequest({ request }) {
      const token = await getAuthorizationToken();
      request.headers.set("Authorization", `Bearer ${token}`);
      return request;
    },
  });
  return {
    findBySiren: findUniteLegaleBySirenFactory(client),
    findBySiret: findUniteLegaleBySiretFactory(client),
  };
}

export type ApiInseeClient = ReturnType<typeof createApiInseeClient>;
