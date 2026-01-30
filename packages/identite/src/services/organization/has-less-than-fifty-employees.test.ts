//

import { hasLessThanFiftyEmployees } from "#src/services/organization";
import type { Organization } from "#src/types";
import {
  association_org_info,
  dinum_org_info,
  entreprise_unipersonnelle_org_info,
  lamalou_org_info,
  trackdechets_public_org_info,
} from "#testing/seed/organizations";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("hasLessThanFiftyEmployees", () => {
  it("should return true for organization with null tranche effectifs", () => {
    assert.equal(hasLessThanFiftyEmployees(entreprise_unipersonnelle_org_info), true);
  });

  it("should return true for organization with NN tranche effectifs", () => {
    assert.equal(hasLessThanFiftyEmployees(trackdechets_public_org_info), true);
  });

  it("should return true for organization with 00 tranche effectifs", () => {
    assert.equal(hasLessThanFiftyEmployees(association_org_info), true);
  });

  it("should return true for organization with 12 tranche effectifs (20-49 employees)", () => {
    assert.equal(hasLessThanFiftyEmployees(lamalou_org_info), true);
  });

  it("should return false for organization with 22 tranche effectifs (100-199 employees)", () => {
    assert.equal(hasLessThanFiftyEmployees(dinum_org_info), false);
  });

  it("should return false for organization with undefined tranche effectifs", () => {
    assert.equal(hasLessThanFiftyEmployees({} as Organization), false);
  });
});
