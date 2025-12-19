export const CHECK_NAMES = ["session_auth", "user_connected"] as const;

export type CheckName = (typeof CHECK_NAMES)[number];

export type DenyReason = { code: "forbidden" } | { code: "not_connected" };

export type Decision = { type: "pass" } | { type: "deny"; reason: DenyReason };
