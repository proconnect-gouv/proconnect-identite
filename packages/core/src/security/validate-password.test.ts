//

import bcrypt from "bcryptjs";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validatePassword } from "./validate-password.js";

//

describe("validatePassword", () => {
  it("should verify a password", async () => {
    const hash = bcrypt.hashSync("🔑", bcrypt.genSaltSync(10));
    const isSamePassword = await validatePassword("🔑", hash);
    assert.equal(isSamePassword, true);
  });

  it("should return false if the password is empty", async () => {
    const hash = bcrypt.hashSync("🔑", bcrypt.genSaltSync(10));
    const isSamePassword = await validatePassword("", hash);
    assert.equal(isSamePassword, false);
  });

  it("should return false if the hash is null", async () => {
    const isSamePassword = await validatePassword("🔑", null);
    assert.equal(isSamePassword, false);
  });
});
