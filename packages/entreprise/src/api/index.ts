//

import type { ApiEntrepriseOpenApiClient } from "#src/client";
import type { FetchOptions } from "openapi-fetch";
import { findMandatairesSociauxBySirenFactory } from "./infogreffe/index.js";
import { findBySirenFactory } from "./insee/find-by-siren.js";
import { findBySiretFactory } from "./insee/find-by-siret.js";

export function createApiEntrepriseInseeRepository(
  client: ApiEntrepriseOpenApiClient,
  context: string,
  recipient: string,
  optionsFn: () => FetchOptions<unknown> = () => ({}),
) {
  return {
    findBySiren: findBySirenFactory(
      client,
      {
        context,
        object: "findEstablishmentBySiren",
        recipient,
      },
      optionsFn,
    ),
    findBySiret: findBySiretFactory(
      client,
      {
        context,
        object: "findEstablishmentBySiret",
        recipient,
      },
      optionsFn,
    ),
  };
}
export type ApiEntrepriseInseeRepository = ReturnType<
  typeof createApiEntrepriseInseeRepository
>;

//

export function createApiEntrepriseInfogreffeRepository(
  client: ApiEntrepriseOpenApiClient,
  context: string,
  recipient: string,
  optionsFn: () => FetchOptions<unknown> = () => ({}),
) {
  return {
    findMandatairesSociauxBySiren: findMandatairesSociauxBySirenFactory(
      client,
      {
        context,
        object: "findMandatairesSociauxBySiren",
        recipient,
      },
      optionsFn,
    ),
  };
}
export type ApiEntrepriseInfogreffeRepository = ReturnType<
  typeof createApiEntrepriseInfogreffeRepository
>;
