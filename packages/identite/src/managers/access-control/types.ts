import type { PipelineContext } from "./coherency.js";

//
// Minimal types for access control pipeline
//

export type DenyReasonCode =
  | "forbidden"
  | "not_connected"
  | "user_not_found"
  | "email_not_verified"
  | "email_verification_renewal"
  | "login_required"
  | "two_factor_auth_required"
  | "two_factor_choice_required";

export type DenyReason = {
  code: DenyReasonCode;
};

/**
 * Result of a single check function.
 *
 * - `pass`: Check passed, continue to next check
 * - `deny`: Check failed, stop pipeline and redirect/reject
 */
export type CheckOutput<TPass extends string, TDeny extends string = string> =
  | { type: "pass"; name: TPass }
  | { type: "deny"; name: TDeny; reason: DenyReason };

/**
 * Check function signature.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CheckFn<TPass extends string = string, TCtx = any> = (
  ctx: TCtx,
) => CheckOutput<TPass, any>;

/**
 * Result after running a pipeline.
 */
export type PipelineResult<TName extends string = string> =
  | { type: "pass" }
  | { type: "deny"; name: TName; reason: DenyReason };

//
// Type inference helpers
//

export type InferCheckNames<TChecks extends readonly CheckFn[]> =
  ReturnType<TChecks[number]> extends CheckOutput<infer TName> ? TName : never;

/**
 * Extract only the pass names from a check's return type.
 * These are the valid checkpoint names for `break_on`.
 */
type ExtractPassName<T> = T extends { type: "pass"; name: infer TName }
  ? TName
  : never;

export type InferPassNames<TChecks extends readonly CheckFn[]> =
  ExtractPassName<ReturnType<TChecks[number]>>;

export type InferContext<TChecks extends readonly CheckFn[]> =
  PipelineContext<TChecks>;
