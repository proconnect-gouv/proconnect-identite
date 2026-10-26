import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  type fiveDices,
  generateDicewarePhrase,
} from "./generate-diceware-phrase.js";

describe("generateDicewarePhrase", () => {
  let rolls: fiveDices[];
  const mockedGenerator = (): fiveDices => rolls.shift()!;

  beforeEach(() => {
    rolls = ["11111", "22222", "33333"];
  });

  it("should generate two words", () => {
    const phrase = generateDicewarePhrase(2, mockedGenerator);
    assert.equal(phrase, "abandon-cireuse");
  });

  it("should generate three words", () => {
    const phrase = generateDicewarePhrase(3, mockedGenerator);
    assert.equal(phrase, "abandon-cireuse-gazette");
  });
});
