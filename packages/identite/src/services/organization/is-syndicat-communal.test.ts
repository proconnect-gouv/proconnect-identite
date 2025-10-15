import type { Organization } from "#src/types";
import assert from "node:assert";
import { describe, it } from "node:test";
import { isSyndicatCommunal } from "./is-syndicat-communal.js";

describe("isSyndicatCommunal", () => {
  it("should return false when cached_activite_principale is undefined", () => {
    const org = {} as Organization;
    assert.equal(isSyndicatCommunal(org), false);
  });

  it("should return false when cached_activite_principale is null", () => {
    const org = { cached_activite_principale: null } as Organization;
    assert.equal(isSyndicatCommunal(org), false);
  });

  it("should return false for a code NAF not in the list", () => {
    const org = {
      cached_activite_principale: "47.11F",
    } as Organization;
    assert.equal(isSyndicatCommunal(org), false);
  });

  it("should return true for code 84.11Z (Administration publique générale)", () => {
    const org = {
      cached_activite_principale: "84.11Z",
    } as Organization;
    assert.equal(isSyndicatCommunal(org), true);
  });

  it("should be case insensitive", () => {
    const org = {
      cached_activite_principale: "84.11z",
    } as Organization;
    assert.equal(isSyndicatCommunal(org), true);
  });
});
