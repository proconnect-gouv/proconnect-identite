//

import { isEntrepriseUnipersonnelle } from "#src/services/organization";
import type { Organization } from "#src/types";
import {
  association_org_info,
  entreprise_unipersonnelle_org_info,
  small_association_org_info,
} from "#testing/seed/organizations";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("isEntrepriseUnipersonnelle", () => {
  it("should return false for bad call", () => {
    assert.equal(isEntrepriseUnipersonnelle({} as Organization), false);
  });

  it("should return true for unipersonnelle organization", () => {
    assert.equal(
      isEntrepriseUnipersonnelle(entreprise_unipersonnelle_org_info),
      true,
    );
  });

  it("should return false for association", () => {
    assert.equal(isEntrepriseUnipersonnelle(association_org_info), false);
  });

  it("should return false for small association", () => {
    assert.equal(isEntrepriseUnipersonnelle(small_association_org_info), false);
  });
});
