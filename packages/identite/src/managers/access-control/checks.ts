import type { User } from "../../types/index.js";
import { deny, pass } from "./check-helpers.js";

//
// Check: session_auth
// Guards against API-style auth headers on web routes
//

export type SessionAuthContext = {
  uses_auth_headers: boolean;
};

/**
 * Rejects requests that use Authorization headers (Bearer, Basic, etc.)
 * These should use the API endpoints, not the web session endpoints.
 *
 * Semantic names:
 * - "web_request": Request uses session/cookies - normal web flow
 * - "api_request_rejected": Request used API-style headers on web route
 */
export function check_session_auth(ctx: SessionAuthContext) {
  if (ctx.uses_auth_headers) {
    return deny("forbidden");
  }
  return pass("web_request");
}

//
// Check: user_connected
// Ensures user has an authenticated session
//

export type UserConnectedContext = {
  is_within_authenticated_session: boolean;
  is_method_head: boolean;
};

/**
 * Requires an authenticated session.
 *
 * Semantic names:
 * - "session_active": User has valid authenticated session
 * - "session_missing": No authenticated session found
 */
export function check_user_connected(ctx: UserConnectedContext) {
  if (ctx.is_method_head) {
    return pass("session_active", {
      is_within_authenticated_session: true as const,
    });
  }
  if (!ctx.is_within_authenticated_session) {
    return deny("not_connected");
  }
  return pass("session_active", {
    is_within_authenticated_session: true as const,
  });
}

//
// Check: user_exists
// Ensures the user referenced in session still exists in database
//

export type UserExistsContext = {
  user?: User;
};

/**
 * Requires user to exist in database.
 * Handles case where user was deleted but session still exists.
 *
 * Semantic names:
 * - "user_found": User exists in database
 * - "user_not_found": User was deleted, session is stale
 */
export function check_user_exists(ctx: UserExistsContext) {
  if (ctx.user === undefined) {
    return deny("user_not_found");
  }
  return pass("user_found", { user: ctx.user });
}

//
// Check: email_verified
// Ensures user's email is verified and current
//

export type EmailVerifiedContext = {
  user: User;
  needs_email_verification_renewal: boolean;
};

/**
 * Requires verified email.
 *
 * Semantic names:
 * - "email_confirmed": Email is verified and current
 * - "email_unverified": Email has never been verified
 * - "email_renewal_needed": Email was verified but needs renewal
 */
export function check_email_verified(ctx: EmailVerifiedContext) {
  if (!ctx.user.email_verified) {
    return deny("email_not_verified");
  }
  if (ctx.needs_email_verification_renewal) {
    return deny("email_verification_renewal");
  }
  return pass("email_confirmed", { user: ctx.user });
}

//
// Check: connected_recently
// Ensures user session is fresh
//

export type ConnectedRecentlyContext = {
  user: User;
  has_authenticated_recently: boolean;
};

/**
 * Requires recent authentication.
 *
 * Semantic names:
 * - "session_fresh": User authenticated recently
 * - "session_stale": User authenticated too long ago
 */
export function check_connected_recently(ctx: ConnectedRecentlyContext) {
  if (!ctx.user) {
    return pass("session_fresh");
  }
  if (!ctx.has_authenticated_recently) {
    return deny("login_required");
  }
  return pass("session_fresh", { user: ctx.user });
}

//
// Check: two_factor_auth
// Ensures user has completed 2FA if required
//

export type TwoFactorAuthContext = {
  user: User;
  should_force_2fa: boolean;
  two_factors_auth_requested: boolean;
  is_within_two_factor_authenticated_session: boolean;
  is_2fa_capable: boolean;
};

/**
 * Requires 2FA if forced or requested.
 *
 * Semantic names:
 * - "2fa_completed": 2FA is done or not required
 * - "2fa_required": User needs to perform 2FA
 * - "2fa_choice_needed": User needs to choose 2FA method
 */
export function check_two_factor_auth(ctx: TwoFactorAuthContext) {
  const is_2fa_required =
    ctx.should_force_2fa || ctx.two_factors_auth_requested;

  if (is_2fa_required && !ctx.is_within_two_factor_authenticated_session) {
    if (ctx.is_2fa_capable) {
      return deny("two_factor_auth_required");
    } else {
      return deny("two_factor_choice_required");
    }
  }

  return pass("2fa_completed", { user: ctx.user });
}
