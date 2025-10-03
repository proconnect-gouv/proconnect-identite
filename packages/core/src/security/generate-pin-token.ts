//

import { customAlphabet } from "nanoid";

//

const nanoidPin = customAlphabet("0123456789", 10);

//

export function generatePinToken() {
  return nanoidPin();
}
