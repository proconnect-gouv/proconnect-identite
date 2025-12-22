import type {
  CheckEstablishes,
  CheckInput,
  CheckPassNames,
} from "./check-helpers.js";
import type {
  CheckFn,
  CheckResult,
  DenyReasonCode,
  PipelineResult,
} from "./types.js";

/**
 * Validates if the accumulated context satisfies the check's requirements.
 */
type Satisfies<TAvailable, TRequired> = TAvailable extends TRequired
  ? true
  : false;

/**
 * Custom error message displayed in the IDE when check ordering is invalid.
 */
type PipelineError<TMessage extends string> = TMessage & {
  __brand: "PipelineError";
};

type GetIncompatibleKeys<TAvailable, TRequired> = {
  [K in keyof TRequired]: TAvailable extends Record<K, TRequired[K]>
    ? never
    : K;
}[keyof TRequired];

/**
 * The immutable CheckChainBuilder allows composing a type-safe pipeline of checks.
 */
export class CheckChainBuilder<
  TInitial extends object = object,
  TAccumulated extends object = TInitial,
  TPassNames extends string = never,
  TDenyCodes extends DenyReasonCode = never,
  TChecks extends readonly CheckFn<any, any, any>[] = readonly [],
> {
  constructor(private readonly checks: TChecks = [] as any) {}

  /**
   * Adds a check to the pipeline.
   * Validates that the check's requirements are met by the accumulated context.
   */
  add<TCheck extends CheckFn<any, any, any>>(
    check: Satisfies<TAccumulated, CheckInput<TCheck>> extends true
      ? TCheck
      : PipelineError<`🚨 PIPELINE HALTED: This check requires '${Extract<
          GetIncompatibleKeys<TAccumulated, CheckInput<TCheck>>,
          string
        >}' to be established, but it is currently missing or incompatible! 🤦🏻‍♀️ - without it, this pipeline is as useful as a bicycle with no wheels! 😜`>,
  ): CheckChainBuilder<
    TInitial,
    TAccumulated & CheckEstablishes<TCheck>,
    TPassNames | CheckPassNames<TCheck>,
    | TDenyCodes
    | (TCheck extends CheckFn<any, any, infer TCode> ? TCode : never),
    readonly [...TChecks, TCheck]
  > {
    return new CheckChainBuilder<any, any, any, any, any>([
      ...(this.checks as any),
      check,
    ]) as any;
  }

  /**
   * Finalizes the pipeline and returns a runner.
   */
  build() {
    return {
      checks: this.checks,
      PassNames: {} as TPassNames,
      RequiredContext: {} as TInitial,
      run: (
        ctx: TInitial,
        options?: { break_on?: TPassNames },
      ): PipelineResult<TDenyCodes> => {
        // At runtime, the ctx passed to run() contains all required facts.
        // As checks run, they may narrow/refine this context.
        // We cast to any for the execution loop since the type safety is enforced at composition.
        const currentCtx = ctx as any;

        for (const check of this.checks) {
          const result = check(currentCtx) as CheckResult<any, any, any>;

          if (result.type === "deny") {
            return result;
          }

          if (options?.break_on && result.name === options.break_on) {
            return { type: "pass" };
          }
        }

        return { type: "pass" };
      },
    };
  }

  /**
   * Inferred types for external use (loaders, etc.)
   */
  get RequiredContext(): TInitial {
    throw new Error("Type-only property");
  }
}

/**
 * Creates a new CheckChainBuilder.
 */
export function createCheckChain<
  TInitial extends object = object,
>(): CheckChainBuilder<TInitial, TInitial, never, never, []> {
  return new CheckChainBuilder();
}
