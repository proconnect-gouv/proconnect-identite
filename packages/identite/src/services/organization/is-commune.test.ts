//

import { isCommune } from "#src/services/organization";
import type { Organization } from "#src/types";
import { dinum_org_info, lamalou_org_info } from "#testing/seed/organizations";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const communaute_de_communes_org_info = {
  siret: "20007184300060",
  cached_tranche_effectifs: "22",
  cached_tranche_effectifs_unite_legale: "22",
  cached_libelle_tranche_effectif: "100 à 199 salariés, en 2022",
  cached_activite_principale: "84.11Z",
  cached_libelle_activite_principale:
    "84.11Z - Administration publique générale",
  cached_categorie_juridique: "7346",
  cached_libelle_categorie_juridique: "Communauté de communes",
} as Organization;

describe("isCommune", () => {
  it("should return false for bad call", () => {
    assert.equal(isCommune({} as Organization), false);
  });

  it("should return true for collectivite territoriale", () => {
    assert.equal(isCommune(lamalou_org_info), true);
  });

  it("should return false for administration centrale", () => {
    assert.equal(isCommune(dinum_org_info), false);
  });

  it("should return false for communaute de communes by default", () => {
    assert.equal(isCommune(communaute_de_communes_org_info), false);
  });

  it("should return false for communaute de communes when considerCommunauteDeCommunesAsCommune is false", () => {
    assert.equal(isCommune(communaute_de_communes_org_info, false), false);
  });

  it("should return true for communaute de communes when considerCommunauteDeCommunesAsCommune is true", () => {
    assert.equal(isCommune(communaute_de_communes_org_info, true), true);
  });
});
