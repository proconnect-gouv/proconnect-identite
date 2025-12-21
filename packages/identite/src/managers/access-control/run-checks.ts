import type { CheckFn, PipelineResult } from "./types.js";

/**
 * Executes a pipeline of check functions against a context.
 * Stops on the first "deny" result.
 *
 * @param checks - Array of check functions
 * @param ctx - Context with raw facts about the request
 * @returns PipelineResult - pass or deny with reason
 */
export function run_checks<TCtx>(
  checks: readonly CheckFn<string, TCtx>[],
  ctx: TCtx,
): PipelineResult {
  for (const check of checks) {
    const result = check(ctx);
    if (result.type === "deny") {
      return result;
    }
  }
  return { type: "pass" };
}
