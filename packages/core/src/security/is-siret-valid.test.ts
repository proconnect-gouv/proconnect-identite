//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSiretValid } from "./is-siret-valid.js";

//

describe("isSiretValid", () => {
  it("should return false for undefined value", () => {
    assert.equal(isSiretValid(undefined), false);
  });

  it("should return false for empty string", () => {
    assert.equal(isSiretValid(""), false);
  });

  it("should return false if it contains characters other than number", () => {
    assert.equal(isSiretValid("a2345678901234"), false);
  });
  it("should return false if it contains more that 14 numbers", () => {
    assert.equal(isSiretValid("123456789012345"), false);
  });

  it("should return false if it contains less that 14 numbers", () => {
    assert.equal(isSiretValid("1234567890123"), false);
  });

  it("should return true if it contains exactly 14 numbers", () => {
    assert.equal(isSiretValid("12345678901234"), true);
  });

  it("should return true if it contains exactly 14 numbers with spaces", () => {
    assert.equal(isSiretValid("   123 456  789\n\r01234 \n"), true);
  });
});
