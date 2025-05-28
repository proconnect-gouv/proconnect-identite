//

import type { Dictionary } from "lodash";
import { isNull, omitBy } from "lodash-es";
import type { Adapter, AdapterPayload } from "oidc-provider";
import { findByClientId } from "./oidc-client";

//

export class OidcProviderAdapterForClients implements Adapter {
  consume() {
    return Promise.reject(new Error("Not implemented"));
  }
  destroy() {
    return Promise.reject(new Error("Not implemented"));
  }
  async find(id: string): Promise<AdapterPayload | undefined | void> {
    const client = await findByClientId(id);
    return client ? omitNullProperties(client) : undefined;
  }
  findByUid() {
    return Promise.reject(new Error("Not implemented"));
  }
  findByUserCode() {
    return Promise.reject(new Error("Not implemented"));
  }
  revokeByGrantId() {
    return Promise.reject(new Error("Not implemented"));
  }
  upsert() {
    return Promise.reject(new Error("Not implemented"));
  }
}

function omitNullProperties<T extends object>(object: T): Dictionary<T> {
  return omitBy(object, isNull);
}
