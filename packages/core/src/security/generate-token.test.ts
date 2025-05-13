//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateToken } from "./generate-token.js";

//

describe("generateToken", () => {
  it("should be 64 characters long", () => {
    const token = generateToken();
    assert.equal(token.length, 64);
  });
});
