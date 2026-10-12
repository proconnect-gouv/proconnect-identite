//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAFreeDomain } from "./is-a-free-domain.js";

//

describe("isAFreeDomain", () => {
  [
    "gmail.com",
    "hotmail.com",
    "yahoo.com",
    "outlook.com",
    "aol.com",
    "yopmail.com",
    "9business.fr",
  ].forEach((domain) => {
    it(`should return true for free domains and emails using "${domain}"`, () => {
      assert.equal(isAFreeDomain(domain), true);
      assert.equal(isAFreeDomain(`user@${domain}`), true);
    });
  });

  it("should return false for non-free domains", () => {
    assert.equal(isAFreeDomain("beta.gouv.fr"), false);
  });
});
