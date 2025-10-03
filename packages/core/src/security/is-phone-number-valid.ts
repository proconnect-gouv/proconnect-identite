//

import { isEmpty, isString } from "lodash-es";

//

export function isPhoneNumberValid(
  phoneNumber: unknown,
): phoneNumber is string {
  if (!isString(phoneNumber) || isEmpty(phoneNumber)) {
    return false;
  }

  if (!phoneNumber.match(/^\+?(?:[0-9][ -]?){6,14}[0-9]$/)) {
    return false;
  }

  return true;
}
