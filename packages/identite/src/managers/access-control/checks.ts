import type { CheckOutput } from "./types.js";

//
// Check: session_auth
// Guards against API-style auth headers on web routes
//

export type SessionAuthContext = {
  uses_auth_headers: boolean;
};

/**
 * Rejects requests that use Authorization headers (Bearer, Basic, etc.)
 * These should use the API endpoints, not the web session endpoints.
 */
export function check_session_auth(
  ctx: SessionAuthContext,
): CheckOutput<"session_auth"> {
  if (ctx.uses_auth_headers) {
    return {
      type: "deny",
      name: "session_auth",
      reason: { code: "forbidden" },
    };
  }
  return { type: "pass", name: "session_auth" };
}
