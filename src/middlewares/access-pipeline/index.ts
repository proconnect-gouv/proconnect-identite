import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import {
  credential_prompt_checks,
  run_checks,
  signin_requirements_checks,
  type CheckGenerator,
  type CredentialPromptCheck,
  type CredentialPromptContext,
  type Decision,
  type SigninRequirementsCheck,
  type SigninRequirementsContext,
} from "@proconnect-gouv/proconnect.identite/managers/access-control";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { isEmpty } from "lodash-es";
import { HOST } from "../../config/env";
import { isWithinAuthenticatedSession } from "../../managers/session/authenticated";
import {
  getEmailFromUnauthenticatedSession,
  getPartialUserFromUnauthenticatedSession,
} from "../../managers/session/unauthenticated";
import { usesAuthHeaders } from "../../services/uses-auth-headers";

//
// Builder types and implementations
//

type ChecksBuilder<TCtx, TCheck extends string> = {
  checks: (ctx: TCtx) => CheckGenerator<TCheck>;
  load_context: (req: Request) => TCtx;
};

function load_credential_prompt_context(req: Request): CredentialPromptContext {
  const partial_user = getPartialUserFromUnauthenticatedSession(req);
  return {
    has_email_in_session: !isEmpty(getEmailFromUnauthenticatedSession(req)),
    needs_inclusionconnect_welcome:
      partial_user.needsInclusionconnectWelcomePage ?? false,
    uses_auth_headers: usesAuthHeaders(req),
  };
}

function load_signin_requirements_context(
  req: Request,
): SigninRequirementsContext {
  return {
    is_user_connected: isWithinAuthenticatedSession(req.session),
    uses_auth_headers: usesAuthHeaders(req),
  };
}

export const credential_prompt_builder: ChecksBuilder<
  CredentialPromptContext,
  CredentialPromptCheck
> = {
  checks: credential_prompt_checks,
  load_context: load_credential_prompt_context,
};

export const signin_requirements_builder: ChecksBuilder<
  SigninRequirementsContext,
  SigninRequirementsCheck
> = {
  checks: signin_requirements_checks,
  load_context: load_signin_requirements_context,
};

function get_referrer_path(req: Request) {
  const originPath =
    req.method === "GET"
      ? getTrustedReferrerPath(req.originalUrl, HOST)
      : undefined;
  const referrerPath = getTrustedReferrerPath(req.get("Referrer"), HOST);

  return originPath || referrerPath || undefined;
}

export function createAccessControlMiddleware<TCtx, TCheck extends string>(
  builder: ChecksBuilder<TCtx, TCheck>,
  stop_after?: TCheck,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // HEAD requests return empty response for connection checks
      if (stop_after !== "session_auth" && req.method === "HEAD") {
        return res.send();
      }

      const ctx = builder.load_context(req);
      const generator = builder.checks(ctx);
      const decision: Decision = run_checks(generator, stop_after);

      if (decision.type === "pass") {
        return next();
      }

      switch (decision.reason.code) {
        case "email_not_verified":
          return res.redirect("/users/verify-email");
        case "email_verification_renewal":
          return res.redirect(
            "/users/verify-email?notification=email_verification_renewal",
          );
        case "forbidden":
          return next(
            new HttpErrors.Forbidden(
              "Access denied. The requested resource does not require authentication.",
            ),
          );
        case "needs_inclusionconnect_welcome":
          return res.redirect("/users/inclusionconnect-welcome");
        case "no_email_in_session":
          return res.redirect("/users/start-sign-in");
        case "not_connected": {
          const referrerPath = get_referrer_path(req);
          if (referrerPath) {
            req.session.referrerPath = referrerPath;
          }
          return res.redirect("/users/start-sign-in");
        }
        default:
          throw decision.reason satisfies never;
      }
    } catch (error) {
      next(error);
    }
  };
}
