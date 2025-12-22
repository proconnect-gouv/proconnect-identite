import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import {
  check_session_auth,
  run_checks,
  signin_requirements_checks,
  type CheckFn,
  type DenyReasonCode,
  type EffectExecutor,
  type InferPassNames,
  type SigninRequirementsContext,
} from "@proconnect-gouv/proconnect.identite/managers/access-control";
import { type User } from "@proconnect-gouv/proconnect.identite/types";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import {
  FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED,
  HOST,
} from "../../config/env.js";
import { is2FACapable, shouldForce2faForUser } from "../../managers/2fa.js";
import { isBrowserTrustedForUser } from "../../managers/browser-authentication.js";
import { getOrganizationsByUserId } from "../../managers/organization/main.js";
import {
  getUserFromAuthenticatedSession,
  hasUserAuthenticatedRecently,
  isWithinAuthenticatedSession,
  isWithinTwoFactorAuthenticatedSession,
} from "../../managers/session/authenticated.js";
import {
  isUserVerifiedWithFranceconnect,
  needsEmailVerificationRenewal,
} from "../../managers/user.js";
import { getSelectedOrganizationId } from "../../repositories/redis/selected-organization.js";
import { findById } from "../../repositories/user.js";
import { addQueryParameters } from "../../services/add-query-parameters.js";
import { usesAuthHeaders } from "../../services/uses-auth-headers.js";
import { executeEffect } from "./effect-executor.js";

//
// Access Control Pipeline Infrastructure
//

export type ChecksBuilder<TChecks extends readonly CheckFn[]> = {
  checks: TChecks;
  execute_effect?: EffectExecutor;
  load_context: (req: Request) => any | Promise<any>;
};

function handleDeny(
  code: DenyReasonCode,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  switch (code) {
    case "forbidden":
      return next(
        HttpErrors.Forbidden(
          "Access denied. The requested resource does not require authentication.",
        ),
      );
    case "not_connected": {
      const referrerPath = getReferrerPath(req);
      if (referrerPath) {
        req.session.referrerPath = referrerPath;
      }
      return res.redirect("/users/start-sign-in");
    }
    case "user_not_found": {
      // Destroy stale session
      req.session.destroy(() => {});
      return next(HttpErrors.Unauthorized());
    }
    case "email_not_verified":
      return res.redirect("/users/verify-email");
    case "email_verification_renewal":
      return res.redirect(
        "/users/verify-email?notification=email_verification_renewal",
      );
    case "login_required": {
      const referrerPath = getReferrerPath(req);
      if (referrerPath) {
        req.session.referrerPath = referrerPath;
      }
      return res.redirect("/users/start-sign-in?notification=login_required");
    }
    case "two_factor_auth_required":
      return res.redirect("/users/2fa-sign-in");
    case "two_factor_choice_required":
      return res.redirect("/users/double-authentication-choice");
    case "browser_not_trusted":
      return res.redirect(
        "/users/verify-email?notification=browser_not_trusted",
      );
    case "franceconnect_certification_required":
      return res.redirect("/users/certification-dirigeant");
    case "personal_info_missing":
      return res.redirect("/users/personal-information");
    case "organization_required":
      return res.redirect(
        addQueryParameters("/users/join-organization", {
          siret_hint: req.session.siretHint,
        }),
      );
    case "organization_selection_required":
      return res.redirect("/users/select-organization");
    default: {
      code satisfies never;
    }
  }
}

export type AccessControlOptions<TChecks extends readonly CheckFn[]> = {
  /**
   * Stop the pipeline after a check passes with this name.
   * Useful for creating multiple middlewares from a single pipeline,
   * each stopping at different checkpoints.
   */
  break_on?: InferPassNames<TChecks>;
  /**
   * If true and the request method is HEAD, return an early empty response
   * after the checks pass.
   */
  handle_head?: boolean;
};

export function createAccessControlMiddleware<
  TChecks extends readonly CheckFn[],
>(builder: ChecksBuilder<TChecks>, options?: AccessControlOptions<TChecks>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ctx = await builder.load_context(req);
      const result = await run_checks(builder.checks, ctx, {
        break_on: options?.break_on,
        execute_effect: builder.execute_effect,
      });

      if (result.type === "pass") {
        if (options?.handle_head && req.method === "HEAD") {
          return res.send();
        }
        return next();
      }

      return handleDeny(result.code, req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

//
// Helpers
//

export const getReferrerPath = (req: Request) => {
  // If the method is not GET (ex: POST), then the referrer must be taken from
  // the referrer header. This ensures the referrerPath can be redirected to.
  const originPath =
    req.method === "GET" ? getTrustedReferrerPath(req.originalUrl, HOST) : null;
  const referrerPath = getTrustedReferrerPath(req.get("Referrer"), HOST);

  return originPath || referrerPath || undefined;
};

//
// checkIsUser - rejects API-style auth on web routes
//

const session_auth_checks = [check_session_auth] as const;

export const session_auth_builder: ChecksBuilder<typeof session_auth_checks> = {
  checks: session_auth_checks,
  load_context: (req) => ({
    uses_auth_headers: usesAuthHeaders(req),
  }),
};

//
// signin_requirements_builder - session must be active and user must exist
//

export const signin_requirements_builder: ChecksBuilder<
  typeof signin_requirements_checks
> = {
  checks: signin_requirements_checks,
  execute_effect: executeEffect,
  load_context: async (req): Promise<SigninRequirementsContext> => {
    const isAuthenticated = isWithinAuthenticatedSession(req.session);

    // Gather user if authenticated (findById returns User | undefined)
    let user: User | undefined;
    if (isAuthenticated) {
      const sessionUser = getUserFromAuthenticatedSession(req);
      user = await findById(sessionUser.id);
    }

    // Gather organizations
    const organizations = user ? await getOrganizationsByUserId(user.id) : [];

    // Gather selected organization
    const selected_organization_id = user
      ? ((await getSelectedOrganizationId(user.id)) ?? undefined)
      : undefined;

    return {
      has_authenticated_recently: isAuthenticated
        ? hasUserAuthenticatedRecently(req)
        : false,
      is_2fa_capable: user ? await is2FACapable(user.id) : false,
      is_browser_trusted: user ? isBrowserTrustedForUser(req) : false,
      is_franceconnect_certification_requested:
        !!req.session.certificationDirigeantRequested,
      is_franceconnect_policy_override:
        !!FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED,
      is_method_head: req.method === "HEAD",
      is_user_verified_with_franceconnect:
        !!user &&
        !FEATURE_CONSIDER_ALL_USERS_AS_CERTIFIED &&
        (await isUserVerifiedWithFranceconnect(user.id)),
      is_within_authenticated_session: isAuthenticated,
      is_within_two_factor_authenticated_session:
        isWithinTwoFactorAuthenticatedSession(req),
      must_return_one_organization:
        !!req.session.mustReturnOneOrganizationInPayload,
      needs_email_verification_renewal: user
        ? needsEmailVerificationRenewal(user)
        : false,
      organizations,
      selected_organization_id,
      should_force_2fa: user ? await shouldForce2faForUser(user.id) : false,
      two_factors_auth_requested: !!req.session.twoFactorsAuthRequested,
      user,
      uses_auth_headers: usesAuthHeaders(req),
    };
  },
};
