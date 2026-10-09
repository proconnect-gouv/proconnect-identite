//

import { isDomainValid } from "@proconnect-gouv/proconnect.core/security";

export const isArmeeDomain = (domain: string) => {
  if (!isDomainValid(domain)) {
    return false;
  }
  const ARMEE_DOMAINS = ["intradef.gouv.fr", "def.gouv.fr"];
  return ARMEE_DOMAINS.includes(domain);
};
