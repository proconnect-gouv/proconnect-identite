//

import type { ApiEntrepriseOpenApiClient } from "#src/client";
import { findMandatairesSociauxBySirenFactory } from "./infogreffe/index.js";
import { findBySirenFactory } from "./insee/find-by-siren.js";
import { findBySiretFactory } from "./insee/find-by-siret.js";

export function createApiEntrepriseClient(
  client: ApiEntrepriseOpenApiClient,
  context: string,
  recipient: string,
) {
  return {
    findBySiren: findBySirenFactory(client, {
      context,
      object: "findEstablishmentBySiren",
      recipient,
    }),
    findBySiret: findBySiretFactory(client, {
      context,
      object: "findEstablishmentBySiret",
      recipient,
    }),
    findMandatairesSociauxBySiren: findMandatairesSociauxBySirenFactory(
      client,
      {
        context,
        object: "findMandatairesSociauxBySiren",
        recipient,
      },
    ),
  };
}
export type ApiEntrepriseClient = ReturnType<typeof createApiEntrepriseClient>;
