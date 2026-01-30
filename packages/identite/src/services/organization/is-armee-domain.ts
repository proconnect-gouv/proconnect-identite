//

import { isDomainValid } from "@proconnect-gouv/proconnect.core/security";

//

const ARMEE_DOMAINS = ["intradef.gouv.fr", "def.gouv.fr"];

export function isArmeeDomain(domain: string): boolean {
  if (!isDomainValid(domain)) {
    return false;
  }

  return ARMEE_DOMAINS.includes(domain);
}
