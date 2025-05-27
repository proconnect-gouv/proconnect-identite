//

import type { AdapterFactory } from "oidc-provider";
import { PostgresAdapter } from "../repositories/oidc-provider-adapter-for-clients";
import { RedisAdapter } from "../repositories/redis/oidc-provider-adapter";

//

export const oidcProviderAdapterFactory: AdapterFactory = (name) => {
  return name === "Client" ? new PostgresAdapter() : new RedisAdapter(name);
};
