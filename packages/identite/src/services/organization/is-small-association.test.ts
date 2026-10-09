//

import { isSmallAssociation } from "#src/services/organization";
import type { Organization } from "#src/types";
import {
  association_org_info,
  entreprise_unipersonnelle_org_info,
  small_association_org_info,
} from "#testing/seed/organizations";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("isSmallAssociation", () => {
  it("should return false for bad call", () => {
    assert.equal(isSmallAssociation({} as Organization), false);
  });

  it("should return false for unipersonnelle organization", () => {
    assert.equal(isSmallAssociation(entreprise_unipersonnelle_org_info), false);
  });

  it("should return true for association", () => {
    assert.equal(isSmallAssociation(association_org_info), true);
  });

  it("should return true for small association", () => {
    assert.equal(isSmallAssociation(small_association_org_info), true);
  });
});
