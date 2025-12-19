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

  return { type: "pass" };
}
