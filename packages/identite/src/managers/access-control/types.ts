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
  | "two_factor_choice_required"
  | "browser_not_trusted"
  | "franceconnect_certification_required"
  | "personal_info_missing";

/**
 * Result of a single check function.
 *
 * - `pass`: Check passed, continue to next check. Carries narrowed context.
 * - `deny`: Check failed, stop pipeline and redirect/reject. Carries error code.
 */
export type PassResult<TName extends string, TCtx extends object> = {
  type: "pass";
  name: TName;
  ctx: TCtx;
};

export type DenyResult<TCode extends DenyReasonCode> = {
  type: "deny";
  code: TCode;
};

export type CheckResult<
  TPass extends string = string,
  TCtx extends object = object,
  TCode extends DenyReasonCode = DenyReasonCode,
> = PassResult<TPass, TCtx> | DenyResult<TCode>;

/**
 * Check function signature.
 */
export type CheckFn<
  TPass extends string = string,
  TCtx extends object = any,
  TCode extends DenyReasonCode = DenyReasonCode,
> = (ctx: TCtx) => CheckResult<TPass, any, TCode>;

/**
 * Result after running a pipeline.
 */
export type PipelineResult<TCode extends DenyReasonCode = DenyReasonCode> =
  | { type: "pass" }
  | DenyResult<TCode>;

//
// Type inference helpers
//

/**
 * Extract only the pass names from a check's return type.
 * These are the valid checkpoint names for `break_on`.
 */
type ExtractPassName<T> = T extends { type: "pass"; name: infer TName }
  ? TName
  : never;

export type InferPassNames<TChecks extends readonly CheckFn[]> =
  ExtractPassName<ReturnType<TChecks[number]>>;
