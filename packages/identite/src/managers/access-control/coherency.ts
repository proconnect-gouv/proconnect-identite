import type { User } from "../../types/index.js";
import type { CheckFn } from "./types.js";

/**
 * Mapping between semantic PASS names and the facts they establish.
 * This is used to automatically reduce the required context for downstream checks.
 */
export type EstablishedFacts = {
  user_found: { user: User };
  session_active: { is_within_authenticated_session: true };
};

/**
 * Helper to extract the established fact from a semantic pass name.
 */
type GetEstablishedFact<TPassName> = TPassName extends keyof EstablishedFacts
  ? EstablishedFacts[TPassName]
  : object;

/**
 * Helper to extract established facts from a CheckFn.
 */
type ExtractFactsFromCheck<TCheck> =
  TCheck extends CheckFn<infer TPassName, any>
    ? GetEstablishedFact<TPassName>
    : object;

/**
 * Pure type inference logic to reduce requirements.
 * Subtracts established facts from the required context.
 */
type Subtract<TBase, TSub> = Omit<TBase, keyof TSub>;

/**
 * Recursive pipeline context inference.
 * Calculates the total required context for a chain of checks,
 * accounting for fact establishment.
 */
export type PipelineContext<
  TChecks extends readonly CheckFn[],
  TCurrentFacts = object,
> = TChecks extends readonly [infer TFirst, ...infer TRest]
  ? TFirst extends CheckFn<string, infer TCtx>
    ? TRest extends readonly CheckFn[]
      ? Subtract<TCtx, TCurrentFacts> &
          PipelineContext<TRest, TCurrentFacts & ExtractFactsFromCheck<TFirst>>
      : Subtract<TCtx, TCurrentFacts>
    : never
  : object;

/**
 * Helper to define a check chain with pure type inference.
 * Enforces that checks are logically ordered and reduces the required loader context.
 *
 * Use it like this:
 * const chain = define_check_chain([check_a, check_b] as const);
 */
export function define_check_chain<TChecks extends readonly CheckFn[]>(
  checks: TChecks,
): TChecks {
  return checks;
}
