//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPhoneNumberValid } from "./is-phone-number-valid.js";

//

describe("isPhoneNumberValid", () => {
  [
    undefined,
    null,
    0,
    true,
    "📞",
    "FR",
    "Jean Michel",
    "$",
    "&",
    "(",
    ")",
    "+33210",
  ].forEach((name) => {
    it(`should return false for "${name}"`, () => {
      assert.equal(isPhoneNumberValid(name), false);
    });
  });

  it("should return true for '0123456789'", () => {
    assert.equal(isPhoneNumberValid("0123456789"), true);
  });

  it("should return true for '0-1-2-3-4-5-6-7-8-9'", () => {
    assert.equal(isPhoneNumberValid("0-1-2-3-4-5-6-7-8-9"), true);
  });

  it("should return true for '+00123456'", () => {
    assert.equal(isPhoneNumberValid("+00123456"), true);
  });

  it("should return true for '+33123456789'", () => {
    assert.equal(isPhoneNumberValid("+33123456789"), true);
  });
});
