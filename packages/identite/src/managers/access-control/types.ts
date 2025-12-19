export const CHECK_NAMES = [
  "session_auth",
  "user_connected",
  "email_verified",
] as const;

export type CheckName = (typeof CHECK_NAMES)[number];

export type DenyReason =
  | { code: "forbidden" }
  | { code: "not_connected" }
  | { code: "email_not_verified" }
  | { code: "email_verification_renewal" };

export type Decision = { type: "pass" } | { type: "deny"; reason: DenyReason };
