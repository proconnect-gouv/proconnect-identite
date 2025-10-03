//

import type { DebounceSuccessResponse } from "#src/types";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

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
  config?: AxiosRequestConfig,
) {
  return async function singleValidation(email: string) {
    const {
      data: { debounce },
    }: AxiosResponse<DebounceSuccessResponse> = await axios({
      method: "get",
      url: `https://api.debounce.io/v1/?email=${email}&api=${apiKey}`,
      headers: {
        accept: "application/json",
      },
      ...config,
    });

    return debounce;
  };
}

export type SingleValidationHandler = ReturnType<
  typeof singleValidationFactory
>;
