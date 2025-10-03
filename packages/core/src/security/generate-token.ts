//

import { nanoid } from "nanoid";

//

export function generateToken() {
  return nanoid(64);
}
