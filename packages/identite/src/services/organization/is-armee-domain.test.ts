//

import { isArmeeDomain } from "#src/services/organization";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("isArmeeDomain", () => {
  it("should return true for intradef.gouv.fr", () => {
    assert.equal(isArmeeDomain("intradef.gouv.fr"), true);
  });

  it("should return true for def.gouv.fr", () => {
    assert.equal(isArmeeDomain("def.gouv.fr"), true);
  });

  it("should return false for regular gouv.fr domain", () => {
    assert.equal(isArmeeDomain("gouv.fr"), false);
  });

  it("should return false for random domain", () => {
    assert.equal(isArmeeDomain("example.com"), false);
  });

  it("should return false for empty domain", () => {
    assert.equal(isArmeeDomain(""), false);
  });
});
