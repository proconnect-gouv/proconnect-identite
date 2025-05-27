//

import type { Adapter, AdapterPayload } from "oidc-provider";
import { findByClientId } from "./oidc-client";
import { omitNullProperties } from "./redis/oidc-provider";

//

export class PostgresAdapter implements Adapter {
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
