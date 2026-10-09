//

import { mockPingDebounce, pingDebounceFactory } from "./ping.js";
import {
  mockSingleValidation,
  singleValidationFactory,
} from "./single-validation.js";

const mockDebounceClientFactory = () => {
  return {
    singleValidation: mockSingleValidation,
    ping: mockPingDebounce,
  };
};

const debounceClientFactory = (
  apiKey: string,
  config?: { timeout?: number },
) => {
  return {
    singleValidation: singleValidationFactory(apiKey, config),
    ping: pingDebounceFactory(apiKey, config),
  };
};

export { debounceClientFactory, mockDebounceClientFactory };
export type DebounceClientType = ReturnType<typeof debounceClientFactory>;
