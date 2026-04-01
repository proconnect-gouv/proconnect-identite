//

import type { DebounceSuccessResponse } from "#src/types";
import { request } from "./request.js";

//

/**
 * Perform a single email validation request.
 *
 * @see https://developers.debounce.io/reference/single-validation#response-parameters
 * @param apiKey the debounce.io API key
 * @param config the Axios request config
 * @returns Debounce Single Validation response
 */
export function singleValidationFactory(
  apiKey: string,
  config?: { timeout?: number },
) {
  return async function singleValidation(email: string) {
    const {
      data: { debounce },
    } = await request<DebounceSuccessResponse>(
      `https://api.debounce.io/v1/?email=${email}&api=${apiKey}`,
      {
        method: "get",
        headers: {
          accept: "application/json",
        },
        timeout: config?.timeout,
      },
    );

    return debounce;
  };
}

export type SingleValidationHandler = ReturnType<
  typeof singleValidationFactory
>;
