//

import bcrypt from "bcryptjs";

//

export function validatePassword(
  plainPassword: string,
  storedHash: string | null,
) {
  if (!plainPassword || !storedHash) {
    return false;
  }

  return bcrypt.compare(plainPassword || "", storedHash);
}
