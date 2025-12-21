import type { CheckFn, PipelineResult } from "./types.js";

/**
 * Runs a check pipeline.
 *
 * Executes checks in order, stops on first denial.
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
    const output = check(ctx);

    if (output.type === "deny") {
      return { type: "deny", reason: output.reason };
    }
  }

  return { type: "pass" };
}
