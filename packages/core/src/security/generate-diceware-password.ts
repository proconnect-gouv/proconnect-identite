//

import { customAlphabet } from "nanoid";
import dicewareWordlistFrAlt from "../data/diceware-wordlist-fr-alt.js";

//

type dice = "1" | "2" | "3" | "4" | "5" | "6";
type fiveDices = `${dice}${dice}${dice}${dice}${dice}`;
const nanoidFiveDices = customAlphabet("123456", 5);
export const createFiveDices = () => nanoidFiveDices() as fiveDices;

export function GenerateDicewarePassword(
  generators: Array<typeof createFiveDices>,
) {
  return function generatePassword() {
    return generators
      .map((generator) => dicewareWordlistFrAlt[generator()])
      .join("-");
  };
}

export const generateDicewarePassword = GenerateDicewarePassword(
  Array(2).fill(createFiveDices),
);
