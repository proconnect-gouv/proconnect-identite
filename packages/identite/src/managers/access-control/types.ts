//
// Minimal types for access control pipeline
//

export type DenyReasonCode = "forbidden";

export type DenyReason = {
  code: DenyReasonCode;
};

/**
 * Result of a single check function.
 *
 * - `pass`: Check passed, continue to next check
 * - `deny`: Check failed, stop pipeline and redirect/reject
 */
export type CheckOutput<TName extends string> =
  | { type: "pass"; name: TName }
  | { type: "deny"; name: TName; reason: DenyReason };

/**
 * Check function signature.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CheckFn<TName extends string = string, TCtx = any> = (
  ctx: TCtx,
) => CheckOutput<TName>;

/**
 * Result after running a pipeline.
 */
export type PipelineResult =
  | { type: "pass" }
  | { type: "deny"; reason: DenyReason };

//
// Type inference helpers
//

type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type InferCheckNames<TChecks extends readonly CheckFn[]> =
  ReturnType<TChecks[number]> extends CheckOutput<infer TName> ? TName : never;

export type InferContext<TChecks extends readonly CheckFn[]> =
  UnionToIntersection<Parameters<TChecks[number]>[0]>;
