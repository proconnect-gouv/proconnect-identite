//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractFirstName, normalizeText } from "./normalize.js";

//

describe("normalizeText", () => {
  it("converts to uppercase", () => {
    assert.equal(normalizeText("bernard"), "BERNARD");
  });

  it("removes accents and cedillas", () => {
    assert.equal(normalizeText("José"), "JOSE");
    assert.equal(normalizeText("François"), "FRANCOIS");
    assert.equal(normalizeText("Hélène"), "HELENE");
  });

  it("replaces special characters with spaces", () => {
    assert.equal(normalizeText("Jean-Pierre"), "JEAN PIERRE");
    assert.equal(normalizeText("O'Connor"), "O CONNOR");
    assert.equal(normalizeText("Marie.Anne"), "MARIE ANNE");
  });

  it("removes multiple spaces", () => {
    assert.equal(normalizeText("Jean   Pierre"), "JEAN PIERRE");
  });

  it("trims leading and trailing spaces", () => {
    assert.equal(normalizeText("  Jean  "), "JEAN");
  });

  it("handles null and undefined", () => {
    assert.equal(normalizeText(null), "");
    assert.equal(normalizeText(undefined), "");
  });

  it("handles complex names", () => {
    assert.equal(
      normalizeText("Marie-Thérèse D'Aubigné"),
      "MARIE THERESE D AUBIGNE",
    );
  });

  it("handles ligatures", () => {
    assert.equal(normalizeText("Œuvre"), "OEUVRE");
    assert.equal(normalizeText("Cæsar"), "CAESAR");
  });
});

describe("extractFirstName", () => {
  it("extracts first name before space", () => {
    assert.equal(extractFirstName("Jean Pierre"), "JEAN");
    assert.equal(extractFirstName("Marie Thérèse Anne"), "MARIE");
  });

  it("normalizes before extracting", () => {
    assert.equal(extractFirstName("Jean-Pierre"), "JEAN");
    assert.equal(extractFirstName("Marie-Thérèse"), "MARIE");
  });

  it("handles single name", () => {
    assert.equal(extractFirstName("Jean"), "JEAN");
  });

  it("handles null and undefined", () => {
    assert.equal(extractFirstName(null), "");
    assert.equal(extractFirstName(undefined), "");
  });
});
