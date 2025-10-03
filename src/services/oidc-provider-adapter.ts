//

import type { AdapterFactory } from "oidc-provider";
import { OidcProviderAdapterForClients } from "../repositories/oidc-provider-adapter-for-clients";
import { OidcProviderAdapter } from "../repositories/redis/oidc-provider-adapter";

//

export const oidcProviderAdapterFactory: AdapterFactory = (name) => {
  return name === "Client"
    ? new OidcProviderAdapterForClients()
    : new OidcProviderAdapter(name);
};
