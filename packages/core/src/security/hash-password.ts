//

import { hash } from "bcryptjs";

//

// TODO compare to https://github.com/anandundavia/manage-users/blob/master/src/api/utils/security.js
export function hashPassword(plainPassword: string): Promise<string> {
  return hash(plainPassword, 10);
}
