//

// heavily inspired from https://github.com/nowsecure/owasp-password-strength-test/blob/1.3.0/test.js

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPasswordSecure } from "./is-password-secure.js";

//

describe("isPasswordSecure", () => {
  it("should return false for too short password", () => {
    assert.equal(
      isPasswordSecure("password", "user1234567890@test.com"),
      false,
    );
  });
  it("should return false for password with only 2 types of character", () => {
    assert.equal(
      isPasswordSecure("mon mot de passe", "user1234567890@test.com"),
      false,
    );
  });
  it("should return true for long enough password with 4 types of character", () => {
    assert.equal(
      isPasswordSecure("Password123!", "user1234567890@test.com"),
      true,
    );
  });
  it("should return true for passphrase", () => {
    assert.equal(
      isPasswordSecure(
        "agrafe correcte de la batterie du cheval",
        "user1234567890@test.com",
      ),
      true,
    );
  });
  ["Pro Connect forever", "MonComptePro-2023!"].forEach((blacklistedWord) => {
    it("should not contains blacklisted word", () => {
      assert.equal(
        isPasswordSecure(blacklistedWord, "user1234567890@test.com"),
        false,
      );
    });
  });
  it("should not contains users email address", () => {
    assert.equal(
      isPasswordSecure("User1234567890@test.com!", "user1234567890@test.com"),
      false,
    );
  });
});
