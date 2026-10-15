//

import { customAlphabet } from "nanoid";
import dicewareWordlistFrAlt from "../data/diceware-wordlist-fr-alt.js";

//

type dice = "1" | "2" | "3" | "4" | "5" | "6";
type fiveDices = `${dice}${dice}${dice}${dice}${dice}`;
const nanoidFiveDices = customAlphabet("123456", 5);
const createFiveDices = () => nanoidFiveDices() as fiveDices;
const wordlist: Partial<Record<fiveDices, string>> = dicewareWordlistFrAlt;

function rollUntilListedWord(generator: typeof createFiveDices) {
  let word: string | undefined;
  do word = wordlist[generator()];
  while (word === undefined);
  return word;
}

export function GenerarateDicewarePassword(
  generators: Array<typeof createFiveDices>,
) {
  return function generatePassword() {
    return generators.map(rollUntilListedWord).join("-");
  };
}

export const generateDicewarePassword = GenerarateDicewarePassword(
  Array(2).fill(createFiveDices),
);
