import type { CheckGenerator } from "./types.js";

export type SigninRequirementsCheck =
  | "email_verified"
  | "session_auth"
  | "user_connected";

export type SigninRequirementsContext = {
  is_email_verified?: boolean;
  is_user_connected: boolean;
  needs_email_verification_renewal?: boolean;
  uses_auth_headers: boolean;
};

export function* signin_requirements_checks(
  ctx: SigninRequirementsContext,
): CheckGenerator<SigninRequirementsCheck> {
  // session_auth - reject API-style auth headers
  if (ctx.uses_auth_headers) {
    return { type: "deny", reason: { code: "forbidden" } };
  }
  yield "session_auth";

  // user_connected - require authenticated session
  if (!ctx.is_user_connected) {
    return { type: "deny", reason: { code: "not_connected" } };
  }
  yield "user_connected";

  // email_verified - require verified email
  if (ctx.is_email_verified === false) {
    return { type: "deny", reason: { code: "email_not_verified" } };
  }

  if (ctx.needs_email_verification_renewal) {
    return { type: "deny", reason: { code: "email_verification_renewal" } };
  }
  yield "email_verified";

  return { type: "pass" };
}
