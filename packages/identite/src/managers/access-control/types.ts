export type DenyReason =
  | { code: "email_not_verified" }
  | { code: "email_verification_renewal" }
  | { code: "forbidden" }
  | { code: "needs_inclusionconnect_welcome" }
  | { code: "no_email_in_session" }
  | { code: "not_connected" };

export type Decision = { type: "pass" } | { type: "deny"; reason: DenyReason };

export type CheckGenerator<TCheck extends string> = Generator<
  TCheck,
  Decision,
  void
>;
