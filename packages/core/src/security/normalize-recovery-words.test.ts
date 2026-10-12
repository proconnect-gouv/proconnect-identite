//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeRecoveryWords } from "./normalize-recovery-words.js";

//

describe("normalizeRecoveryWords", () => {
  it("should lowercase and remove accents", () => {
    assert.equal(normalizeRecoveryWords("Téléphone Écran"), "telephone ecran");
  });

  it("should accept dashes and multiple spaces as separators", () => {
    assert.equal(
      normalizeRecoveryWords("  abandon--cible   gastrique "),
      "abandon cible gastrique",
    );
  });
});
