import {
  check_connected_recently,
  check_email_verified,
  check_session_auth,
  check_user_connected,
  check_user_exists,
} from "./checks.js";
import { define_check_chain } from "./coherency.js";
import type { InferCheckNames, InferContext } from "./types.js";

/**
 * Signin requirements pipeline checks.
 * Used for routes that require authenticated users.
 *
 * Checks are logically ordered and type-safe via Coherent Chaining:
 * 1. session_auth - Ensures request doesn't use auth headers
 * 2. user_connected - Ensures user has an authenticated session
 * 3. user_exists - Ensures the user still exists in database (Establishes {user: User})
 * 4. email_verified - Ensures user's email is verified
 * 5. connected_recently - Ensures user has authenticated recently
 */
export const signin_requirements_checks = define_check_chain([
  check_session_auth,
  check_user_connected,
  check_user_exists,
  check_email_verified,
  check_connected_recently,
] as const);

export type SigninRequirementsCheck = InferCheckNames<
  typeof signin_requirements_checks
>;
export type SigninRequirementsContext = InferContext<
  typeof signin_requirements_checks
>;
