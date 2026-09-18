//

import type { DebounceSuccessResponse } from "#src/types";
import { request } from "./request.js";

export function pingDebounceFactory(
  apiKey: string,
  config?: { timeout?: number },
) {
  return async function pingDebounce() {
    const {
      data: { debounce },
    } = await request<DebounceSuccessResponse>(
      `https://api.debounce.io/v1/balance?api=${apiKey}`,
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
