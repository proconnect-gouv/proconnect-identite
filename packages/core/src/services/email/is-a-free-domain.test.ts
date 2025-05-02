//

import assert from "assert/strict";
import { describe, it } from "node:test";
import { isAFreeDomain } from "./is-a-free-domain.js";

//

describe("isAFreeDomain", () => {
  it("should return true for free domains", () => {
    assert.equal(isAFreeDomain("gmail.com"), true);
    assert.equal(isAFreeDomain("hotmail.com"), true);
    assert.equal(isAFreeDomain("yahoo.com"), true);
    assert.equal(isAFreeDomain("outlook.com"), true);
    assert.equal(isAFreeDomain("aol.com"), true);
    assert.equal(isAFreeDomain("yopmail.com"), true);
  });

  it("should return false for non-free domains", () => {
    assert.equal(isAFreeDomain("beta.gouv.fr"), false);
  });
});
