//

import bcrypt from "bcryptjs";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword } from "./hash-password.js";

//

describe("hashPassword", () => {
  it("should hash a password", async () => {
    const hashedPassword = await hashPassword("🔑");
    const isSamePassword = await bcrypt.compare("🔑", hashedPassword);
    assert.equal(isSamePassword, true);
  });
});
