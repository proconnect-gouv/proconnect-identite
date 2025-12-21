import { check_session_auth } from "./checks.js";
import { define_check_chain } from "./coherency.js";
import type { InferCheckNames, InferContext } from "./types.js";

/**
 * Signin requirements pipeline checks.
 * Used for routes that require authenticated users.
 *
 * Checks are logically ordered and type-safe via Coherent Chaining:
 * 1. session_auth - Ensures request doesn't use auth headers
 */
export const signin_requirements_checks = define_check_chain([
  check_session_auth,
] as const);

export type SigninRequirementsCheck = InferCheckNames<
  typeof signin_requirements_checks
>;
export type SigninRequirementsContext = InferContext<
  typeof signin_requirements_checks
>;
