//

import type { DebounceSingleValidationSuccessResponse } from "#src/types";
import { request } from "./request.js";

//

/**
 * Perform a single email validation request.
 *
 * @see https://developers.debounce.com/api-reference/endpoint/single-validation#single-email-validation
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
    } = await request<DebounceSingleValidationSuccessResponse>(
      `https://api.debounce.io/v1/?email=${encodeURIComponent(email)}&api=${encodeURIComponent(apiKey)}`,
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

/**
 * Mock single email validation response.
 *
 * @see https://developers.debounce.com/api-reference/endpoint/single-validation#single-email-validation
 * @param apiKey the debounce.io API key
 * @param config the Axios request config
 * @returns Debounce Single Validation response
 */

export function mockSingleValidation(
  email: string,
): Promise<DebounceSingleValidationSuccessResponse["debounce"]> {
  const localPart = email.split("@")[0];
  const domain = email.split("@")[1];
  if (domain === "invalid-domain.com") {
    return Promise.resolve({
      send_transactional: "0",
      did_you_mean: "",
      code: "6",
    }) as any;
  }
  if (domain === "ypomail.com") {
    return Promise.resolve({
      send_transactional: "0",
      did_you_mean: `${localPart}@yopmail.com`,
      code: "6",
    }) as any;
  }
  return Promise.resolve({
    send_transactional: "1",
    did_you_mean: undefined,
    code: "200",
  }) as any;
}

export type SingleValidationHandler = ReturnType<
  typeof singleValidationFactory
>;
