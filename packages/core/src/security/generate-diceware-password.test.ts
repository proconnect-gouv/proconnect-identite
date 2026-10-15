//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  generateDicewarePhrase,
  type fiveDices,
} from "./generate-diceware-phrase.js";

//

const sequence = (...values: fiveDices[]) => {
  let index = 0;
  return () => values[index++];
};

describe("generateDicewarePhrase", () => {
  it("should generate two words", () => {
    assert.equal(
      generateDicewarePhrase(2, sequence("11111", "22222")),
      "abandon-cireuse",
    );
  });

  it("should generate three words", () => {
    assert.equal(
      generateDicewarePhrase(3, sequence("11111", "22222", "33333")),
      "abandon-cireuse-gazette",
    );
  });
});
