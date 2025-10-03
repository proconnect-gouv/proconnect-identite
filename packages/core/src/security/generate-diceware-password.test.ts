//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GenerarateDicewarePassword } from "./generate-diceware-password.js";

//

describe("GenerarateDicewarePassword", () => {
  it("should generate two words", () => {
    const generatePassword = GenerarateDicewarePassword([
      () => "11111",
      () => "22222",
    ]);
    assert.equal(generatePassword(), "abandon-cible");
  });

  it("should generate three words", () => {
    const generatePassword = GenerarateDicewarePassword([
      () => "11111",
      () => "22222",
      () => "33333",
    ]);
    assert.equal(generatePassword(), "abandon-cible-gastrique");
  });
});
