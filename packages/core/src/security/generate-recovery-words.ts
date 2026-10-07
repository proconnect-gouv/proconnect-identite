//

import dicewareWordlistFrAlt from "../data/diceware-wordlist-fr-alt.js";
import { createFiveDices } from "./generate-diceware-password.js";

//

export function GenerateRecoveryWords(
  generators: Array<typeof createFiveDices>,
) {
  return function generateRecoveryWords() {
    return generators.map((generator) => dicewareWordlistFrAlt[generator()]);
  };
}

export const generateRecoveryWords = GenerateRecoveryWords(
  Array(6).fill(createFiveDices),
);
