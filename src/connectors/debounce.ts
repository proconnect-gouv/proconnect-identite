import { getEmailDomain } from "@gouvfr-lasuite/proconnect.core/services/email";
import { singleValidationFactory } from "@gouvfr-lasuite/proconnect.debounce/api";
import {
  DEBOUNCE_API_KEY,
  EMAIL_DELIVERABILITY_WHITELIST,
  FEATURE_CHECK_EMAIL_DELIVERABILITY,
  HTTP_CLIENT_TIMEOUT,
} from "../config/env";
import { logger } from "../services/log";

type EmailDebounceInfo = {
  isEmailSafeToSend: boolean;
  didYouMean?: string;
};

export const singleValidation = singleValidationFactory(DEBOUNCE_API_KEY, {
  timeout: HTTP_CLIENT_TIMEOUT,
});

export const isEmailSafeToSendTransactional = async (
  email: string,
): Promise<EmailDebounceInfo> => {
  if (!FEATURE_CHECK_EMAIL_DELIVERABILITY) {
    logger.info(`Email address "${email}" not verified.`);

    return { isEmailSafeToSend: true };
  }

  const domain = getEmailDomain(email);
  if (EMAIL_DELIVERABILITY_WHITELIST.includes(domain)) {
    logger.info(`Email address "${email}" is whitelisted.`);

    return { isEmailSafeToSend: true };
  }

  try {
    const {
      send_transactional,
      did_you_mean: didYouMean,
      code,
    } = await singleValidation(email);
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
