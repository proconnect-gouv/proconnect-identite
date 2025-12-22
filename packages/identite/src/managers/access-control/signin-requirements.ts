import type { User } from "../../types/index.js";
import { createCheckChain } from "./chain-builder.js";
import {
  check_connected_recently,
  check_email_verified,
  check_session_auth,
  check_two_factor_auth,
  check_user_connected,
  check_user_exists,
} from "./checks.js";

/**
 * Initial context provided by the loader.
 * Properties that need narrowing (like user) should be optional or wider.
 */
export type SigninRequirementsInitialContext = {
  uses_auth_headers: boolean;
  is_within_authenticated_session: boolean;
  is_method_head: boolean;
  user?: User;
  needs_email_verification_renewal: boolean;
  has_authenticated_recently: boolean;
  should_force_2fa: boolean;
  two_factors_auth_requested: boolean;
  is_within_two_factor_authenticated_session: boolean;
  is_2fa_capable: boolean;
};

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
 * 6. two_factor_auth - Ensures user has completed 2FA if required
 */
export const signin_requirements_pipeline =
  createCheckChain<SigninRequirementsInitialContext>()
    .add(check_session_auth)
    .add(check_user_connected)
    .add(check_user_exists)
    .add(check_email_verified)
    .add(check_connected_recently)
    .add(check_two_factor_auth)
    .build();

export const signin_requirements_checks = signin_requirements_pipeline.checks;

export type SigninRequirementsPassNames =
  typeof signin_requirements_pipeline.PassNames;
export type SigninRequirementsContext =
  typeof signin_requirements_pipeline.RequiredContext;
