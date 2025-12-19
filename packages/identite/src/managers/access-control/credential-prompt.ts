import type { CheckGenerator } from "./types.js";

export type CredentialPromptCheck =
  | "email_in_session"
  | "inclusionconnect_welcome"
  | "session_auth";

export type CredentialPromptContext = {
  has_email_in_session: boolean;
  needs_inclusionconnect_welcome: boolean;
  uses_auth_headers: boolean;
};

export function* credential_prompt_checks(
  ctx: CredentialPromptContext,
): CheckGenerator<CredentialPromptCheck> {
  // session_auth - reject API-style auth headers
  if (ctx.uses_auth_headers) {
    return { type: "deny", reason: { code: "forbidden" } };
  }
  yield "session_auth";

  // email_in_session - require email in unauthenticated session
  if (!ctx.has_email_in_session) {
    return { type: "deny", reason: { code: "no_email_in_session" } };
  }
  yield "email_in_session";

  // inclusionconnect_welcome - check if user needs to see welcome page
  if (ctx.needs_inclusionconnect_welcome) {
    return { type: "deny", reason: { code: "needs_inclusionconnect_welcome" } };
  }
  yield "inclusionconnect_welcome";

  return { type: "pass" };
}
