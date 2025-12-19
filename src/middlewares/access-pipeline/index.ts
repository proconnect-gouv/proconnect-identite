import {
  decide_access,
  type CheckName,
} from "@proconnect-gouv/proconnect.identite/managers/access-control";
import type { NextFunction, Request, Response } from "express";
import HttpErrors from "http-errors";
import { usesAuthHeaders } from "../../services/uses-auth-headers";

export function createAccessControlMiddleware(until: CheckName) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const decision = decide_access(
        { uses_auth_headers: usesAuthHeaders(req) },
        until,
      );

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
        case "not_connected":
          return res.redirect("/users/start-sign-in");
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
