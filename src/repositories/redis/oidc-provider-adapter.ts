//

import { isEmpty } from "lodash";
import type { Adapter, AdapterPayload } from "oidc-provider";
import {
  consumable,
  getClient,
  grantable,
  grantKeyFor,
  uidKeyFor,
  userCodeKeyFor,
} from "./oidc-provider";

//

export class RedisAdapter implements Adapter {
  constructor(public name: string) {}

  async upsert(id: string, payload: AdapterPayload, expiresIn: number) {
    const key = this.key(id);
    const store = consumable.has(this.name)
      ? { payload: JSON.stringify(payload) }
      : JSON.stringify(payload);

    const multi = getClient().multi();
    // @ts-ignore
    multi[consumable.has(this.name) ? "hmset" : "set"](key, store);

    if (expiresIn) {
      multi.expire(key, expiresIn);
    }

    if (grantable.has(this.name) && payload.grantId) {
      const grantKey = grantKeyFor(payload.grantId);
      multi.rpush(grantKey, key);
      // if you're seeing grant key lists growing out of acceptable proportions consider using LTRIM
      // here to trim the list to an appropriate length
      const ttl = await getClient().ttl(grantKey);
      if (expiresIn > ttl) {
        multi.expire(grantKey, expiresIn);
      }
    }

    if (payload.userCode) {
      const userCodeKey = userCodeKeyFor(payload.userCode);
      multi.set(userCodeKey, id);
      multi.expire(userCodeKey, expiresIn);
    }

    if (payload.uid) {
      const uidKey = uidKeyFor(payload.uid);
      multi.set(uidKey, id);
      multi.expire(uidKey, expiresIn);
    }

    await multi.exec();
  }

  async find(id: string): Promise<AdapterPayload | undefined | void> {
    const data = consumable.has(this.name)
      ? await getClient().hgetall(this.key(id))
      : await getClient().get(this.key(id));

    if (isEmpty(data)) {
      return undefined;
    }

    if (typeof data === "string") {
      return JSON.parse(data);
    }

    const { payload, ...rest } = data as {
      payload: string;
      [key: string]: any;
    };
    return {
      ...rest,
      ...JSON.parse(payload),
    };
  }

  async findByUid(uid: string) {
    const id = await getClient().get(uidKeyFor(uid));
    if (!id) return undefined;
    return this.find(id);
  }

  async findByUserCode(userCode: string) {
    const id = await getClient().get(userCodeKeyFor(userCode));
    if (!id) return undefined;
    return this.find(id);
  }

  async destroy(id: string) {
    const key = this.key(id);
    await getClient().del(key);
  }

  async revokeByGrantId(grantId: string) {
    const multi = getClient().multi();
    const tokens = await getClient().lrange(grantKeyFor(grantId), 0, -1);
    tokens.forEach((token: any) => multi.del(token));
    multi.del(grantKeyFor(grantId));
    await multi.exec();
  }

  async consume(id: string) {
    await getClient().hset(
      this.key(id),
      "consumed",
      Math.floor(Date.now() / 1000),
    );
  }

  key(id: string) {
    return `${this.name}:${id}`;
  }
}
