//

import {
  getEmailDomain,
  isAFreeDomain,
} from "@gouvfr-lasuite/proconnect.core/services/email";
import {
  FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE,
  FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE,
} from "../config/env";

export const isAFreeEmailProvider = (domain: string) => {
  if (FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_FREE) {
    return true;
  }

  if (FEATURE_CONSIDER_ALL_EMAIL_DOMAINS_AS_NON_FREE) {
    return false;
  }

  return isAFreeDomain(domain);
};

export const usesAFreeEmailProvider = (email: string) => {
  const domain = getEmailDomain(email);

  return isAFreeEmailProvider(domain);
};
