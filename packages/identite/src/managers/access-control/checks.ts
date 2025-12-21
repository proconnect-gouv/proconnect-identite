import type { User } from "../../types/index.js";
import type { CheckOutput } from "./types.js";

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
export function check_session_auth(
  ctx: SessionAuthContext,
): CheckOutput<"web_request", "api_request_rejected"> {
  if (ctx.uses_auth_headers) {
    return {
      type: "deny",
      name: "api_request_rejected",
      reason: { code: "forbidden" },
    };
  }
  return { type: "pass", name: "web_request" };
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
export function check_user_connected(
  ctx: UserConnectedContext,
): CheckOutput<"session_active", "session_missing"> {
  if (ctx.is_method_head) {
    return { type: "pass", name: "session_active" };
  }
  if (!ctx.is_within_authenticated_session) {
    return {
      type: "deny",
      name: "session_missing",
      reason: { code: "not_connected" },
    };
  }
  return { type: "pass", name: "session_active" };
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
export function check_user_exists(
  ctx: UserExistsContext,
): CheckOutput<"user_found", "user_not_found"> {
  if (ctx.user === undefined) {
    return {
      type: "deny",
      name: "user_not_found",
      reason: { code: "user_not_found" },
    };
  }
  return { type: "pass", name: "user_found" };
}

//
// Check: email_verified
// Ensures user's email is verified and current
//

export type EmailVerifiedContext = {
  user?: User;
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
export function check_email_verified(
  ctx: EmailVerifiedContext,
): CheckOutput<"email_confirmed", "email_unverified" | "email_renewal_needed"> {
  if (!ctx.user) {
    // If no user is present, this check cannot perform its duty.
    // We pass and let check_user_exists handle the denial.
    return { type: "pass", name: "email_confirmed" };
  }
  if (!ctx.user.email_verified) {
    return {
      type: "deny",
      name: "email_unverified",
      reason: { code: "email_not_verified" },
    };
  }
  if (ctx.needs_email_verification_renewal) {
    return {
      type: "deny",
      name: "email_renewal_needed",
      reason: { code: "email_verification_renewal" },
    };
  }
  return { type: "pass", name: "email_confirmed" };
}

//
// Check: connected_recently
// Ensures user session is fresh
//

export type ConnectedRecentlyContext = {
  user?: User;
  has_authenticated_recently: boolean;
};

/**
 * Requires recent authentication.
 *
 * Semantic names:
 * - "session_fresh": User authenticated recently
 * - "session_stale": User authenticated too long ago
 */
export function check_connected_recently(
  ctx: ConnectedRecentlyContext,
): CheckOutput<"session_fresh", "session_stale"> {
  if (!ctx.user) {
    return { type: "pass", name: "session_fresh" };
  }
  if (!ctx.has_authenticated_recently) {
    return {
      type: "deny",
      name: "session_stale",
      reason: { code: "login_required" },
    };
  }
  return { type: "pass", name: "session_fresh" };
}
