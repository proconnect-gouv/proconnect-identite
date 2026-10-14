//

import { normalizeDicewareWords } from "./normalize-diceware-words.js";
import { validatePassword } from "./validate-password.js"; // adapte le chemin

//

export function validateRecoveryWords(
  input: string,
  storedHash: string | null,
) {
  return validatePassword(normalizeDicewareWords(input), storedHash);
}
