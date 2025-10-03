//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generatePinToken } from "./generate-pin-token.js";

//

describe("generatePinToken", () => {
  it("should use digits only", () => {
    const token = generatePinToken();
    assert.match(token, /^[0-9]{10}$/);
  });

  it("should be 10 characters long", () => {
    const token = generatePinToken();
    assert.equal(token.length, 10);
  });
});
