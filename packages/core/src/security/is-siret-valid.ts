//

import { isEmpty, isString } from "lodash-es";

//

export function isSiretValid(siret: unknown): siret is string {
  if (!isString(siret) || isEmpty(siret)) {
    return false;
  }

  const siretNoSpaces = siret.replace(/\s/g, "");

  return /^\d{14}$/.test(siretNoSpaces);
}
