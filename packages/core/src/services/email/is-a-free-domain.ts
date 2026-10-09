//

import mostUsedFreeEmailDomains from "#src/data/most-used-free-email-domains";
import { isFree } from "is-disposable-email-domain";
import { getEmailDomain } from "./get-email-domain.js";

//

// heavily inspired from https://stackoverflow.com/questions/71232973/check-email-domain-type-personal-email-or-company-email#answer-72640757
export function isAFreeDomain(string: string) {
  const domain = getEmailDomain(string);

  return isFree(domain) || mostUsedFreeEmailDomains.includes(domain);
}
