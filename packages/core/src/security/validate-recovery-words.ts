//

import { normalizeRecoveryWords } from "./normalize-recovery-words.js";
import { validatePassword } from "./validate-password.js"; // adapte le chemin

//

export function validateRecoveryWords(
  input: string,
  storedHash: string | null,
) {
  return validatePassword(normalizeRecoveryWords(input), storedHash);
}
