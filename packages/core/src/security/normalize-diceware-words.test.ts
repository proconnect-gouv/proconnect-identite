import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeDicewareWords } from "./normalize-diceware-words.js";

describe("normalizeDicewareWords", () => {
  const rawTokens = [
    "crème brûlée façon grand-mère",
    "Crème Brûlée fAçon Grand-Mère",
    "  crème  brûlée     façon  grand-mère  ",
  ];

  rawTokens.forEach((rawToken) => {
    it("should return normalized token", () => {
      assert.equal(
        normalizeDicewareWords(rawToken),
        "creme-brulee-facon-grand-mere",
      );
    });
  });
});
