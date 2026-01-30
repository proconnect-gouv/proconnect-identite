//

import { isEducationNationaleDomain } from "#src/services/organization";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("isEducationNationaleDomain", () => {
  it("should return false for non educ nat domain with z prefix", () => {
    assert.equal(isEducationNationaleDomain("zac-orleans.fr"), false);
  });

  it("should return false for educ nat domain with .net suffix", () => {
    assert.equal(isEducationNationaleDomain("ac-bordeaux.fr.net"), false);
  });

  it("should return false for educ nat domain with .gouv.fr suffix", () => {
    assert.equal(isEducationNationaleDomain("ac-bordeaux.gouv.fr"), false);
  });

  it("should return true for educ nat domain with hyphen", () => {
    assert.equal(isEducationNationaleDomain("ac-orleans-tours.fr"), true);
  });

  it("should return true for educ nat domain", () => {
    assert.equal(isEducationNationaleDomain("ac-bordeaux.fr"), true);
  });

  it("should return false for invalid domain", () => {
    assert.equal(isEducationNationaleDomain(""), false);
  });
});
