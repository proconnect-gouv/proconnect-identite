import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isEmailValid } from "./is-email-valid.js";

describe("isEmailValid", () => {
  it("should return false for undefined value", () => {
    assert.equal(isEmailValid(undefined), false);
  });

  it("should return false for empty string", () => {
    assert.equal(isEmailValid(""), false);
  });

  it("should return false if no @ is present", () => {
    assert.equal(isEmailValid("test"), false);
  });

  it("should return false if no domain is present", () => {
    assert.equal(isEmailValid("test@"), false);
  });

  it("should return false if two @ are present", () => {
    assert.equal(isEmailValid("test@test@test"), false);
  });

  it("should return false if domains contain other than letters, numbers, hyphens (-) and periods (.)", () => {
    assert.equal(isEmailValid("test@test_test"), false);
  });

  it("should return false if tld has the wrong case", () => {
    assert.equal(isEmailValid("jean@wanadoo.Fr"), false);
  });

  it("should return false if local part is longer than 63 characters", () => {
    assert.equal(
      isEmailValid(
        "1234567890123456789012345678901234567890123456789012345678901234@test",
      ),
      false,
    );
  });

  it("should return false if total length is longer than 254 characters", () => {
    assert.equal(
      isEmailValid(
        "test@1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890",
      ),
      false,
    );
  });

  // this test cases have been taken from
  // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript/32686261#32686261
  const validEmailAddresses = [
    "prettyandsimple@example.com",
    "very.common@example.com",
    "disposable.style.email.with+symbol@example.com",
    "other.email-with-dash@example.com",
    "#!$%&'*+-/=?^_`{}|~@example.org",
    '"()[]:,;\\"!#$%&\'*+-/=?^_`{}| ~.a"@example.org',
    '" "@example.org', // space between the quotes
    "üñîçøðé@example.com", // Unicode characters in local part
    "Pelé@example.com", // Latin
  ];

  validEmailAddresses.forEach((validEmailAddress) => {
    it(`should return true for valid email address: "${validEmailAddress}"`, () => {
      assert.equal(isEmailValid(validEmailAddress), true);
    });
  });
});
