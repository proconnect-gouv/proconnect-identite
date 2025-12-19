import type { CheckGenerator, Decision } from "./types.js";

export function run_checks<TCheck extends string>(
  generator: CheckGenerator<TCheck>,
  stop_after?: TCheck,
): Decision {
  while (true) {
    const result = generator.next();

    if (result.done) {
      return result.value;
    }

    if (result.value === stop_after) {
      return { type: "pass" };
    }
  }
}
