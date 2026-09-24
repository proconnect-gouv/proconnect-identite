import {
  debounceClientFactory,
  mockDebounceClientFactory,
  type DebounceClientType,
} from "@proconnect-gouv/proconnect.debounce/api";
import {
  DEBOUNCE_API_KEY,
  FEATURE_MOCK_DEBOUNCE_API,
  HTTP_CLIENT_TIMEOUT,
} from "../config/env";
import { logger } from "../services/log";

type EmailDebounceInfo = {
  isEmailSafeToSend: boolean;
  didYouMean?: string;
};

const debounceClient: DebounceClientType = FEATURE_MOCK_DEBOUNCE_API
  ? mockDebounceClientFactory()
  : debounceClientFactory(DEBOUNCE_API_KEY, {
      timeout: HTTP_CLIENT_TIMEOUT,
    });

export const pingDebounceApi = debounceClient.ping;

export const isEmailSafeToSendTransactional = async (
  email: string,
): Promise<EmailDebounceInfo> => {
  try {
    const {
      send_transactional,
      did_you_mean: didYouMean,
      code,
    } = await debounceClient.singleValidation(email);
    const isEmailSafeToSend = send_transactional === "1";

    if (isEmailSafeToSend) {
      logger.info(
        `Email address "${email}" is safe to send (code ${code}).${didYouMean ? ` Suggested email ${didYouMean}` : ""}`,
      );
    } else {
      logger.warn(
        `Email address "${email}" is NOT safe to send (code ${code}).${didYouMean ? ` Suggested email ${didYouMean}` : ""}`,
      );
    }

    return { isEmailSafeToSend, didYouMean };
  } catch (error) {
    throw new Error("Error from Debounce API", { cause: error });
  }
};
