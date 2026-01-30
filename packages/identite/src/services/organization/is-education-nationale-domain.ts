//

import { isDomainValid } from "@proconnect-gouv/proconnect.core/security";

//

export function isEducationNationaleDomain(domain: string): boolean {
  if (!isDomainValid(domain)) {
    return false;
  }

  return domain.match(/^ac-[a-zA-Z0-9-]*\.fr$/) !== null;
}
