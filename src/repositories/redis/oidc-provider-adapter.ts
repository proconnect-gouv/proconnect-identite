// source https://github.com/panva/node-oidc-provider/blob/6fbcd71b08b8b8f381a97a82809de42c75904c6b/example/adapters/redis.js

import { isEmpty } from "lodash-es";
import type { Adapter, AdapterPayload } from "oidc-provider";
import { getNewRedisClient } from "../../connectors/redis";

//

const getClient = () => getNewRedisClient();

const grantable = new Set([
  "AccessToken",
  "AuthorizationCode",
  "RefreshToken",
  "DeviceCode",
  "BackchannelAuthenticationRequest",
]);

const consumable = new Set([
  "AuthorizationCode",
  "RefreshToken",
  "DeviceCode",
  "BackchannelAuthenticationRequest",
]);

function prefixed(key: string) {
  return `oidc:${key}`;
}

function grantKeyFor(id: string) {
  return prefixed(`grant:${id}`);
}

function userCodeKeyFor(userCode: string) {
  return prefixed(`userCode:${userCode}`);
}

function uidKeyFor(uid: string) {
  return prefixed(`uid:${uid}`);
}

type Store = { payload: string };

export class OidcProviderAdapter implements Adapter {
  constructor(public name: string) {}

  async upsert(id: string, payload: AdapterPayload, expiresIn: number) {
    const key = this.key(id);

    const multi = getClient().multi();
    if (consumable.has(this.name)) {
      multi.hSet(prefixed(key), { payload: JSON.stringify(payload) });
    } else {
      multi.set(prefixed(key), JSON.stringify(payload));
    }

    if (expiresIn) {
      multi.expire(prefixed(key), expiresIn);
    }

    if (grantable.has(this.name) && payload.grantId) {
      const grantKey = grantKeyFor(payload.grantId);
      multi.rPush(grantKey, key);
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
      ? await getClient().hGetAll(prefixed(this.key(id)))
      : await getClient().get(prefixed(this.key(id)));

    if (isEmpty(data)) {
      return undefined;
    }

    if (typeof data === "string") {
      return JSON.parse(data);
    }

    const { payload, ...rest } = data as AdapterPayload & Store;
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
    await getClient().del(prefixed(this.key(id)));
  }

  async revokeByGrantId(grantId: string) {
    const multi = getClient().multi();
    const tokens = await getClient().lRange(grantKeyFor(grantId), 0, -1);
    tokens.forEach((token) => multi.del(prefixed(token)));
    multi.del(grantKeyFor(grantId));
    await multi.exec();
  }

  async consume(id: string) {
    await getClient().hSet(
      prefixed(this.key(id)),
      "consumed",
      Math.floor(Date.now() / 1000),
    );
  }

  key(id: string) {
    return `${this.name}:${id}`;
  }
}
