import type { DenyReasonCode, DenyResult, PassResult } from "./types.js";

/**
 * Creates a successful check result with a semantic name and optional narrowed context.
 */
export function pass<TName extends string>(
  name: TName,
): PassResult<TName, object>;
export function pass<TName extends string, TCtx extends object>(
  name: TName,
  ctx: TCtx,
): PassResult<TName, TCtx>;
export function pass<TName extends string, TCtx extends object>(
  name: TName,
  ctx?: TCtx,
): PassResult<TName, TCtx | object> {
  return {
    type: "pass",
    name,
    ctx: ctx ?? {},
  };
}

/**
 * Creates a failed check result with a reason code.
 */
export function deny<TCode extends DenyReasonCode>(
  code: TCode,
): DenyResult<TCode> {
  return {
    type: "deny",
    code,
  };
}

/**
 * Type extractor for a check function's input context.
 */
export type CheckInput<T> = T extends (ctx: infer TCtx) => any ? TCtx : never;

/**
 * Type extractor for the context a check establishes when it passes.
 */
export type CheckEstablishes<T> = T extends (ctx: any) => infer R
  ? Extract<R, { type: "pass" }> extends PassResult<any, infer TCtx>
    ? TCtx
    : object
  : object;

/**
 * Type extractor for the pass names a check can return.
 */
export type CheckPassNames<T> = T extends (ctx: any) => infer R
  ? Extract<R, { type: "pass" }> extends PassResult<infer TName, any>
    ? TName
    : never
  : never;

/**
 * Type extractor for the deny codes a check can return.
 */
export type CheckDenyCodes<T> = T extends (ctx: any) => infer R
  ? Extract<R, { type: "deny" }> extends DenyResult<infer TCode>
    ? TCode
    : never
  : never;
