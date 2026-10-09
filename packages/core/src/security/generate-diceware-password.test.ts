//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GenerateDicewarePassword } from "./generate-diceware-password.js";

//

describe("GenerateDicewarePassword", () => {
  it("should generate two words", () => {
    const generatePassword = GenerateDicewarePassword([
      () => "11111",
      () => "22222",
    ]);
    assert.equal(generatePassword(), "abandon-cible");
  });

  it("should generate three words", () => {
    const generatePassword = GenerateDicewarePassword([
      () => "11111",
      () => "22222",
      () => "33333",
    ]);
    assert.equal(generatePassword(), "abandon-cible-gastrique");
  });
});
