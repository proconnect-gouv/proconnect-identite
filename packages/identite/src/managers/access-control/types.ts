export const CHECK_NAMES = [
  "session_auth",
  "user_connected",
  "email_verified",
  "email_in_session",
  "inclusionconnect_welcome",
] as const;

export type CheckName = (typeof CHECK_NAMES)[number];

export type DenyReason =
  | { code: "forbidden" }
  | { code: "not_connected" }
  | { code: "email_not_verified" }
  | { code: "email_verification_renewal" }
  | { code: "no_email_in_session" }
  | { code: "needs_inclusionconnect_welcome" };

export type Decision = { type: "pass" } | { type: "deny"; reason: DenyReason };
