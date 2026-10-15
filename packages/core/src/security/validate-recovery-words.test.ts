import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword } from "./hash-password.js";
import { validateRecoveryWords } from "./validate-recovery-words.js";

describe("validateRecoveryWords", () => {
  it("should accept words typed with different case, accents and separators", async () => {
    const storedHash = await hashPassword("telephone-abandon-cible");
    assert.equal(
      await validateRecoveryWords("Téléphone-abandon   CIBLE", storedHash),
      true,
    );
  });

  it("should reject wrong words", async () => {
    const storedHash = await hashPassword("telephone-abandon-cible");
    assert.equal(
      await validateRecoveryWords("abandon cible", storedHash),
      false,
    );
  });

  it("should reject when no hash is stored", async () => {
    assert.equal(await validateRecoveryWords("abandon cible", null), false);
  });
});
