//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  convertCommuneCode,
  convertCountryIsoToCog,
  isValidBirthplaceFormat,
} from "./birthplace-conversion.js";

//

describe("convertCommuneCode", () => {
  it("converts old commune code to new code", () => {
    assert.equal(convertCommuneCode("75050"), "92050");
  });

  it("returns original code if no conversion exists", () => {
    assert.equal(convertCommuneCode("75056"), "75056");
  });

  it("handles null and undefined", () => {
    assert.equal(convertCommuneCode(null), null);
    assert.equal(convertCommuneCode(undefined), null);
  });
});

describe("convertCountryIsoToCog", () => {
  it("converts France", () => {
    assert.equal(convertCountryIsoToCog("FRA"), "99100");
  });

  it("converts Ireland", () => {
    assert.equal(convertCountryIsoToCog("IRL"), "99136");
  });

  it("converts Iceland with 2-letter code", () => {
    assert.equal(convertCountryIsoToCog("IS"), "99102");
  });

  it("handles lowercase", () => {
    assert.equal(convertCountryIsoToCog("fra"), "99100");
  });

  it("returns null for unknown country", () => {
    assert.equal(convertCountryIsoToCog("XXX"), null);
  });

  it("handles null and undefined", () => {
    assert.equal(convertCountryIsoToCog(null), null);
    assert.equal(convertCountryIsoToCog(undefined), null);
  });
});

describe("isValidBirthplaceFormat", () => {
  it("validates 5-digit codes", () => {
    assert.equal(isValidBirthplaceFormat("75001"), true);
    assert.equal(isValidBirthplaceFormat("92050"), true);
  });

  it("validates Corsican codes (2A/2B)", () => {
    assert.equal(isValidBirthplaceFormat("2A001"), true);
    assert.equal(isValidBirthplaceFormat("2B042"), true);
  });

  it("rejects invalid formats", () => {
    assert.equal(isValidBirthplaceFormat("1234"), false);
    assert.equal(isValidBirthplaceFormat("123456"), false);
    assert.equal(isValidBirthplaceFormat("ABC12"), false);
  });

  it("handles null and undefined", () => {
    assert.equal(isValidBirthplaceFormat(null), false);
    assert.equal(isValidBirthplaceFormat(undefined), false);
  });
});
