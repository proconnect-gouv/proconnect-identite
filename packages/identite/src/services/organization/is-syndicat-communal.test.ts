import type { Organization } from "#src/types";
import assert from "node:assert";
import { describe, it } from "node:test";
import { isSyndicatCommunal } from "./is-syndicat-communal.js";

describe("isSyndicatCommunal", () => {
  it("should return false when cached_libelle_categorie_juridique is undefined", () => {
    const org = {} as Organization;
    assert.equal(isSyndicatCommunal(org), false);
  });

  it("should return false when cached_libelle_categorie_juridique is null", () => {
    const org = { cached_activite_principale: null } as Organization;
    assert.equal(isSyndicatCommunal(org), false);
  });

  it("should return false for a categorie juridique not in the list", () => {
    const org = {
      cached_libelle_categorie_juridique:
        "cette catégorie juridique n'existe pas",
    } as Organization;
    assert.equal(isSyndicatCommunal(org), false);
  });

  it("should return true for categorie juridique 'Syndicat mixte fermé' ", () => {
    const org = {
      cached_libelle_categorie_juridique: "Syndicat mixte fermé",
    } as Organization;
    assert.equal(isSyndicatCommunal(org), true);
  });
});
