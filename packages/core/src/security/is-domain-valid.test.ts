//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isDomainValid } from "./is-domain-valid.js";

//

describe("isDomainValid", () => {
  it("should return false for undefined value", () => {
    assert.equal(isDomainValid(undefined), false);
  });

  it("should return false for empty string", () => {
    assert.equal(isDomainValid(""), false);
  });

  it("should return false if contains characters other than number and letters", () => {
    assert.equal(isDomainValid("héééééé"), false);
  });

  it("should allow dot less tld", () => {
    assert.equal(isDomainValid("co.uk"), true);
  });
  it("should allow gouv.fr", () => {
    assert.equal(isDomainValid("gouv.fr"), true);
  });
});
