//

import { customAlphabet } from "nanoid";
import dicewareWordlistFrAlt from "../data/diceware-wordlist-fr-alt.js";

//

type dice = "1" | "2" | "3" | "4" | "5" | "6";
export type fiveDices = `${dice}${dice}${dice}${dice}${dice}`;
const nanoidFiveDices = customAlphabet("123456", 5);
export const createFiveDices = () => nanoidFiveDices() as fiveDices;

export const generateDicewarePhrase = (
  lenght: number,
  generator = createFiveDices,
) => {
  return Array(lenght)
    .fill(null)
    .map(() => dicewareWordlistFrAlt[generator()])
    .join("-");
};
