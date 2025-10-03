import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeOfficialContactEmailVerificationToken } from "../src/services/normalize-official-contact-email-verification-token";

describe("normalizeOfficialContactEmailVerificationToken", () => {
  const rawTokens = [
    "crème brûlée façon grand-mère",
    "Crème Brûlée fAçon Grand-Mère",
    "  crème  brûlée     façon  grand-mère  ",
  ];

  rawTokens.forEach((rawToken) => {
    it("should return normalized token", () => {
      assert.equal(
        normalizeOfficialContactEmailVerificationToken(rawToken),
        "creme-brulee-facon-grand-mere",
      );
    });
  });
});
