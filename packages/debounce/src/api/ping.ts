//

import type { DebounceBalanceSuccessResponse } from "#src/types";
import { request } from "./request.js";

export function pingDebounceFactory(
  apiKey: string,
  config?: { timeout?: number },
) {
  return async function pingDebounce() {
    await request<DebounceBalanceSuccessResponse>(
      `https://api.debounce.io/v1/balance?api=${apiKey}`,
      {
        method: "get",
        headers: {
          accept: "application/json",
        },
        timeout: config?.timeout,
      },
    );

    return true;
  };
}

export function mockPingDebounce() {
  return Promise.resolve(true);
}
