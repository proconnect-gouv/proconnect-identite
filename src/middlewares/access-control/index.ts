import { getTrustedReferrerPath } from "@proconnect-gouv/proconnect.core/security";
import {
  type CheckFn,
  type DenyReason,
  type InferContext,
  check_session_auth,
  run_checks,
} from "@proconnect-gouv/proconnect.identite/managers/access-control";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { HOST } from "../../config/env.js";
import { usesAuthHeaders } from "../../services/uses-auth-headers.js";

//
// Access Control Pipeline Infrastructure
//

export type ChecksBuilder<TChecks extends readonly CheckFn[]> = {
  checks: TChecks;
  load_context: (req: Request) => InferContext<TChecks>;
};

function handleDeny(reason: DenyReason, _res: Response, next: NextFunction) {
  switch (reason.code) {
    case "forbidden":
      return next(
        HttpErrors.Forbidden(
          "Access denied. The requested resource does not require authentication.",
        ),
      );
    default: {
      const _exhaustive: never = reason.code;
      return _exhaustive;
    }
  }
}

export function createAccessControlMiddleware<
  TChecks extends readonly CheckFn[],
>(builder: ChecksBuilder<TChecks>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const ctx = builder.load_context(req);
      const result = run_checks(builder.checks, ctx);

      if (result.type === "pass") {
        return next();
      }

      return handleDeny(result.reason, res, next);
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
