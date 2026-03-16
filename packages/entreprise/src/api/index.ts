//

import type { ApiEntrepriseOpenApiClient } from "#src/client";
import { findMandatairesSociauxBySirenFactory } from "./infogreffe/index.js";
import { findBySirenFactory } from "./insee/find-by-siren.js";
import { findBySiretFactory } from "./insee/find-by-siret.js";

export function createApiEntrepriseInseeClient(
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
  };
}
export type ApiEntrepriseInseeClient = ReturnType<
  typeof createApiEntrepriseInseeClient
>;

//

export function createApiEntrepriseInfogreffeClient(
  client: ApiEntrepriseOpenApiClient,
  context: string,
  recipient: string,
) {
  return {
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
export type ApiEntrepriseInfogreffeClient = ReturnType<
  typeof createApiEntrepriseInfogreffeClient
>;
