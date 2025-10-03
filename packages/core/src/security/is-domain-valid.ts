//

import { isEmpty, isString } from "lodash-es";
import { parse_host } from "tld-extract";

//

/*
 * specifications of these functions can be found at
 * https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#email-address-validation
 */
export function isDomainValid(domain: unknown): domain is string {
  if (!isString(domain) || isEmpty(domain)) {
    return false;
  }

  if (domain.match(/^[a-zA-Z0-9.-]*$/) === null) {
    return false;
  }

  try {
    parse_host(domain, { allowDotlessTLD: true });
  } catch {
    return false;
  }

  return true;
}
