// source https://github.com/panva/node-oidc-provider/blob/6fbcd71b08b8b8f381a97a82809de42c75904c6b/example/adapters/redis.js
import type { Dictionary } from "lodash";
import { isNull, omitBy } from "lodash-es";
import { getNewRedisClient } from "../../connectors/redis";

export const getClient = () =>
  getNewRedisClient({
    keyPrefix: "oidc:",
  });

export const grantable = new Set([
  "AccessToken",
  "AuthorizationCode",
  "RefreshToken",
  "DeviceCode",
  "BackchannelAuthenticationRequest",
]);

export const consumable = new Set([
  "AuthorizationCode",
  "RefreshToken",
  "DeviceCode",
  "BackchannelAuthenticationRequest",
]);

export function grantKeyFor(id: any) {
  return `grant:${id}`;
}

export function userCodeKeyFor(userCode: any) {
  return `userCode:${userCode}`;
}

export function uidKeyFor(uid: any) {
  return `uid:${uid}`;
}
export function omitNullProperties<T extends object>(object: T): Dictionary<T> {
  return omitBy(object, isNull);
}
