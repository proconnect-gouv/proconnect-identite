//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  GenerateRecoveryWords,
  generateRecoveryWords,
} from "./generate-recovery-words.js";

//

describe("GenerateRecoveryWords", () => {
  it("should generate two words", () => {
    const generate = GenerateRecoveryWords([() => "11111", () => "22222"]);
    assert.deepEqual(generate(), ["abandon", "cible"]);
  });

  it("should generate three words", () => {
    const generate = GenerateRecoveryWords([
      () => "11111",
      () => "22222",
      () => "33333",
    ]);
    assert.deepEqual(generate(), ["abandon", "cible", "gastrique"]);
  });
});

describe("generateRecoveryWords", () => {
  it("should generate six words", () => {
    assert.equal(generateRecoveryWords().length, 6);
  });
});
