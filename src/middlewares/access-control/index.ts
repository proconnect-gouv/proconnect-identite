import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import {
  check_session_auth,
  run_checks,
  signin_requirements_checks,
  type CheckFn,
  type DenyReason,
  type InferContext,
  type InferPassNames,
  type SigninRequirementsContext,
} from "@proconnect-gouv/proconnect.identite/managers/access-control";
import { type User } from "@proconnect-gouv/proconnect.identite/types";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { HOST } from "../../config/env.js";
import {
  getUserFromAuthenticatedSession,
  isWithinAuthenticatedSession,
} from "../../managers/session/authenticated.js";
import { needsEmailVerificationRenewal } from "../../managers/user.js";
import { findById } from "../../repositories/user.js";
import { usesAuthHeaders } from "../../services/uses-auth-headers.js";

//
// Access Control Pipeline Infrastructure
//

export type ChecksBuilder<TChecks extends readonly CheckFn[]> = {
  checks: TChecks;
  load_context: (
    req: Request,
  ) => InferContext<TChecks> | Promise<InferContext<TChecks>>;
};

function handleDeny(
  reason: DenyReason,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  switch (reason.code) {
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
    default: {
      const _exhaustive: never = reason.code;
      return _exhaustive;
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
      const result = run_checks(builder.checks, ctx, {
        break_on: options?.break_on,
      });

      if (result.type === "pass") {
        if (options?.handle_head && req.method === "HEAD") {
          return res.send();
        }
        return next();
      }

      return handleDeny(result.reason, req, res, next);
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
  load_context: async (req): Promise<SigninRequirementsContext> => {
    const isAuthenticated = isWithinAuthenticatedSession(req.session);

    // Gather user if authenticated (findById returns User | undefined)
    let user: User | undefined;
    if (isAuthenticated) {
      const sessionUser = getUserFromAuthenticatedSession(req);
      user = await findById(sessionUser.id);
    }

    return {
      uses_auth_headers: usesAuthHeaders(req),
      is_within_authenticated_session: isAuthenticated,
      is_method_head: req.method === "HEAD",
      user,
      needs_email_verification_renewal: user
        ? needsEmailVerificationRenewal(user)
        : false,
    };
  },
};
