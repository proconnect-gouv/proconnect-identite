import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import {
  decide_access,
  type AccessContext,
  type CheckName,
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
// Context loaders for different middleware chains
//

function load_credential_prompt_context(req: Request): AccessContext {
  const partial_user = getPartialUserFromUnauthenticatedSession(req);
  return {
    uses_auth_headers: usesAuthHeaders(req),
    has_email_in_session: !isEmpty(getEmailFromUnauthenticatedSession(req)),
    is_user_connected: isWithinAuthenticatedSession(req.session),
    needs_inclusionconnect_welcome:
      partial_user.needsInclusionconnectWelcomePage,
  };
}

function load_signin_requirements_context(req: Request): AccessContext {
  return {
    uses_auth_headers: usesAuthHeaders(req),
    is_user_connected: isWithinAuthenticatedSession(req.session),
  };
}

const CONTEXT_LOADERS: Record<CheckName, (req: Request) => AccessContext> = {
  email_in_session: load_credential_prompt_context,
  inclusionconnect_welcome: load_credential_prompt_context,
  session_auth: load_signin_requirements_context,
  user_connected: load_signin_requirements_context,
  email_verified: load_signin_requirements_context,
};

function get_referrer_path(req: Request) {
  const originPath =
    req.method === "GET"
      ? getTrustedReferrerPath(req.originalUrl, HOST)
      : undefined;
  const referrerPath = getTrustedReferrerPath(req.get("Referrer"), HOST);

  return originPath || referrerPath || undefined;
}

export function createAccessControlMiddleware(until: CheckName) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // HEAD requests return empty response for connection checks
      if (until !== "session_auth" && req.method === "HEAD") {
        return res.send();
      }

      const ctx = CONTEXT_LOADERS[until](req);
      const decision = decide_access(ctx, until);

      if (decision.type === "pass") {
        return next();
      }

      switch (decision.reason.code) {
        case "forbidden":
          return next(
            new HttpErrors.Forbidden(
              "Access denied. The requested resource does not require authentication.",
            ),
          );
        case "no_email_in_session":
          return res.redirect("/users/start-sign-in");
        case "not_connected": {
          const referrerPath = get_referrer_path(req);
          if (referrerPath) {
            req.session.referrerPath = referrerPath;
          }
          return res.redirect("/users/start-sign-in");
        }
        case "email_not_verified":
          return res.redirect("/users/verify-email");
        case "email_verification_renewal":
          return res.redirect(
            "/users/verify-email?notification=email_verification_renewal",
          );
        case "needs_inclusionconnect_welcome":
          return res.redirect("/users/inclusionconnect-welcome");
        default:
          throw decision.reason satisfies never;
      }
    } catch (error) {
      next(error);
    }
  };
}
