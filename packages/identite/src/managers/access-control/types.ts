export const CHECK_NAMES = ["session_auth"] as const;

export type CheckName = (typeof CHECK_NAMES)[number];

export type DenyReason = { code: "forbidden" };

export type Decision = { type: "pass" } | { type: "deny"; reason: DenyReason };
