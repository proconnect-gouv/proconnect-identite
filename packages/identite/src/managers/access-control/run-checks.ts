import type { CheckFn, PipelineResult } from "./types.js";

export type RunChecksOptions<TPassName extends string = string> = {
  /**
   * Stop the pipeline after a check passes with this name.
   * Useful for creating multiple middlewares from a single pipeline,
   * each stopping at different checkpoints.
   */
  break_on?: TPassName;
};

/**
 * Executes a pipeline of check functions against a context.
 * Stops on the first "deny" result, or after a specified pass name.
 *
 * @param checks - Array of check functions
 * @param ctx - Context with raw facts about the request
 * @param options - Optional configuration (break_on for checkpoints)
 * @returns PipelineResult - pass or deny with reason
 */
export function run_checks<TCtx, TPassName extends string = string>(
  checks: readonly CheckFn<string, TCtx>[],
  ctx: TCtx,
  options?: RunChecksOptions<TPassName>,
): PipelineResult {
  for (const check of checks) {
    const result = check(ctx);
    if (result.type === "deny") {
      return result;
    }
    // Stop at checkpoint if requested
    if (options?.break_on && result.name === options.break_on) {
      return { type: "pass" };
    }
  }
  return { type: "pass" };
}
