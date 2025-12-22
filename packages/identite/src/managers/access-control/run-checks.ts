import type {
  CheckFn,
  EffectExecutor,
  InferPassNames,
  PipelineResult,
} from "./types.js";

export type RunChecksOptions<TPassName extends string = string> = {
  /**
   * Stop the pipeline after a check passes with this name.
   * Useful for creating multiple middlewares from a single pipeline,
   * each stopping at different checkpoints.
   */
  break_on?: TPassName;
  /**
   * Optional effect executor. When provided, effects declared by checks
   * are executed immediately after each check completes.
   */
  execute_effect?: EffectExecutor;
};

/**
 * Executes effects declared by a check result.
 */
async function executeEffects(
  effects: readonly unknown[] | undefined,
  executor: EffectExecutor | undefined,
): Promise<void> {
  if (!effects?.length || !executor) {
    return;
  }
  for (const effect of effects) {
    await executor(effect as any);
  }
}

/**
 * Executes a pipeline of check functions against a context.
 * Stops on the first "deny" result, or after a specified pass name.
 * Effects are executed immediately after each check.
 *
 * @param checks - Array of check functions
 * @param ctx - Context with raw facts about the request
 * @param options - Optional configuration (break_on, execute_effect)
 * @returns PipelineResult - pass or deny with reason
 */
export async function run_checks<
  TChecks extends readonly CheckFn<any, any, any>[],
>(
  checks: TChecks,
  ctx: any,
  options?: RunChecksOptions<InferPassNames<TChecks>>,
): Promise<PipelineResult> {
  for (const check of checks) {
    const result = (check as any)(ctx);

    // Execute effects immediately after each check
    await executeEffects(result.effects, options?.execute_effect);

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
