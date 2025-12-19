import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import {
  decide_access,
  type AccessContext,
  type CheckName,
} from "@proconnect-gouv/proconnect.identite/managers/access-control";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { HOST } from "../../config/env";
import { isWithinAuthenticatedSession } from "../../managers/session/authenticated";
import { usesAuthHeaders } from "../../services/uses-auth-headers";

function load_access_context(req: Request, until: CheckName) {
  const ctx: AccessContext = {
    uses_auth_headers: usesAuthHeaders(req),
  };

  if (until === "session_auth") {
    return ctx;
  }

  ctx.is_user_connected = isWithinAuthenticatedSession(req.session);

  return ctx;
}

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

      const ctx = load_access_context(req, until);
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
        default:
          throw decision.reason satisfies never;
      }
    } catch (error) {
      next(error);
    }
  };
}
