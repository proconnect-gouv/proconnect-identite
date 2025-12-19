import type { AccessContext } from "./context.js";
import type { CheckName, Decision } from "./types.js";

export function decide_access(
  ctx: AccessContext,
  stop_after?: CheckName,
): Decision {
  // session_auth - reject API-style auth headers
  if (ctx.uses_auth_headers) {
    return { type: "deny", reason: { code: "forbidden" } };
  }
  if (stop_after === "session_auth") {
    return { type: "pass" };
  }

  // email_in_session - require email in unauthenticated session
  if (ctx.has_email_in_session === false) {
    return { type: "deny", reason: { code: "no_email_in_session" } };
  }
  if (stop_after === "email_in_session") {
    return { type: "pass" };
  }

  // user_connected - require authenticated session
  if (ctx.is_user_connected === false) {
    return { type: "deny", reason: { code: "not_connected" } };
  }
  if (stop_after === "user_connected") {
    return { type: "pass" };
  }

  // email_verified - require verified email
  if (ctx.is_email_verified === false) {
    return { type: "deny", reason: { code: "email_not_verified" } };
  }
  if (ctx.needs_email_verification_renewal) {
    return { type: "deny", reason: { code: "email_verification_renewal" } };
  }
  if (stop_after === "email_verified") {
    return { type: "pass" };
  }

  return { type: "pass" };
}
