//

import { isOrganizationCoveredByCertificationDirigeant } from "#src/services/organization";
import type { Organization } from "#src/types";
import {
  bpifrance_org_info,
  dinum_org_info,
  entreprise_unipersonnelle_org_info,
} from "#testing/seed/organizations";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("isOrganizationCoveredByCertificationDirigeant", () => {
  it("should return false for bad call", () => {
    assert.equal(
      isOrganizationCoveredByCertificationDirigeant({} as Organization),
      false,
    );
  });

  it("should return true for unipersonnelle organization", () => {
    assert.equal(
      isOrganizationCoveredByCertificationDirigeant(
        entreprise_unipersonnelle_org_info,
      ),
      true,
    );
  });

  it("should return true for BPI France", () => {
    assert.equal(
      isOrganizationCoveredByCertificationDirigeant(bpifrance_org_info),
      true,
    );
  });

  it("should return false for administration", () => {
    assert.equal(
      isOrganizationCoveredByCertificationDirigeant(dinum_org_info),
      false,
    );
  });
});
