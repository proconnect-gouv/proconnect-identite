//

import { isEmpty, isString } from "lodash-es";
import { Buffer } from "node:buffer";
import { isDomainValid } from "./is-domain-valid.js";

//

export function isEmailValid(email: unknown): email is string {
  if (!isString(email) || isEmpty(email)) {
    return false;
  }

  const parts = email.split("@").filter((part) => part);

  // The email address contains two parts, separated with an @ symbol.
  // => these parts are non-empty strings
  // => there are two and only two parts
  if (parts.length !== 2) {
    return false;
  }

  // The email address does not contain dangerous characters
  // => the postgres connector is taking care of this

  // The domain part contains only letters, numbers, hyphens (-) and periods (.)
  const domain = parts[1];
  if (!isDomainValid(domain)) {
    return false;
  }

  // The local part (before the @) should be no more than 63 characters.
  const localPart = parts[0];
  if (Buffer.from(localPart).length > 63) {
    return false;
  }

  // The total length should be no more than 254 characters.
  if (Buffer.from(email).length > 254) {
    return false;
  }

  return true;
}
