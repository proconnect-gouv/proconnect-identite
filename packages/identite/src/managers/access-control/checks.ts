import type { Organization, User } from "../../types/index.js";
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
  if (ctx.is_within_authenticated_session) {
    return pass("session_active", {
      is_within_authenticated_session: true as const,
    });
  }
  if (ctx.is_method_head) {
    return pass("session_active");
  }
  return deny("not_connected");
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
  return pass("email_confirmed", {
    user: ctx.user as User & { email_verified: true },
  });
}

//
// Check: connected_recently
// Ensures user session is fresh
//

export type ConnectedRecentlyContext = {
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
  if (!ctx.has_authenticated_recently) {
    return deny("login_required");
  }
  return pass("session_fresh", { has_authenticated_recently: true as const });
}

//
// Check: two_factor_auth
// Ensures user has completed 2FA if required
//

export type TwoFactorAuthContext = {
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
  if (ctx.is_within_two_factor_authenticated_session) {
    return pass("2fa_completed", {
      is_within_two_factor_authenticated_session: true as const,
    });
  }

  const is_2fa_required =
    ctx.should_force_2fa || ctx.two_factors_auth_requested;

  if (!is_2fa_required) {
    return pass("2fa_completed");
  }

  return deny(
    ctx.is_2fa_capable
      ? "two_factor_auth_required"
      : "two_factor_choice_required",
  );
}

//
// Check: browser_trust
// Ensures the browser is trusted for the user
//

export type BrowserTrustContext = {
  is_browser_trusted: boolean;
};

/**
 * Requires the browser to be trusted.
 *
 * Semantic names:
 * - "browser_trusted": Browser is trusted
 * - "browser_untrusted": Browser is not trusted
 */
export function check_browser_trust(ctx: BrowserTrustContext) {
  if (!ctx.is_browser_trusted) {
    return deny("browser_not_trusted");
  }

  return pass("browser_trusted", { is_browser_trusted: true as const });
}

//
// Check: franceconnect_identity
// Ensures user has linked their account with FranceConnect if required
//

export type FranceConnectIdentityContext = {
  is_franceconnect_certification_requested: boolean;
  is_franceconnect_policy_override: boolean;
  is_user_verified_with_franceconnect: boolean;
};

/**
 * Requires FranceConnect identity if requested by client,
 * unless overridden by server policy.
 *
 * Semantic names:
 * - "franceconnect_identity_verified": User is verified with FranceConnect
 * - "franceconnect_identity_not_required_by_policy": FC not required due to server settings
 * - "franceconnect_identity_not_requested": Client did not request FC-level assurance
 */
export function check_franceconnect_identity(
  ctx: FranceConnectIdentityContext,
) {
  if (ctx.is_user_verified_with_franceconnect) {
    return pass("franceconnect_identity_verified", {
      is_user_verified_with_franceconnect: true as const,
    });
  }

  if (ctx.is_franceconnect_policy_override) {
    return pass("franceconnect_identity_not_required_by_policy", {
      is_user_verified_with_franceconnect: true as const,
    });
  }

  if (!ctx.is_franceconnect_certification_requested) {
    return pass("franceconnect_identity_not_requested");
  }

  return deny("franceconnect_certification_required");
}

//
// Check: profile_complete
// Ensures user has filled in their personal information
//

export type ProfileCompleteContext = {
  user: User;
};

/**
 * Requires basic profile information (given name and family name).
 *
 * Semantic names:
 * - "profile_complete": User has provided names
 * - "profile_incomplete": User needs to provide names
 */
export function check_profile_complete(ctx: ProfileCompleteContext) {
  if (!ctx.user.given_name || !ctx.user.family_name) {
    return deny("personal_info_missing");
  }

  return pass("profile_complete", {
    user: ctx.user as User & {
      given_name: string;
      family_name: string;
    },
  });
}

//
// Check: has_organization
// Ensures user belongs to at least one organization
//

export type HasOrganizationContext = {
  organizations: Organization[];
};

/**
 * Requires the user to have at least one organization link.
 *
 * Semantic names:
 * - "has_organization": User belongs to at least one organization
 * - "no_organization": User needs to join an organization
 */
export function check_has_organization(ctx: HasOrganizationContext) {
  if (ctx.organizations.length === 0) {
    return deny("organization_required");
  }

  return pass("has_organization", {
    organizations: ctx.organizations as [Organization, ...Organization[]],
  });
}
