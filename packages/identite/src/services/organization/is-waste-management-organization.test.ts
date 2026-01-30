//

import { isWasteManagementOrganization } from "#src/services/organization";
import type { Organization } from "#src/types";
import {
  lamalou_org_info,
  trackdechets_public_org_info,
} from "#testing/seed/organizations";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("isWasteManagementOrganization", () => {
  it("should return false for collectivité territoriale", () => {
    assert.equal(isWasteManagementOrganization(lamalou_org_info), false);
  });

  it("should return true for waste management organization", () => {
    assert.equal(
      isWasteManagementOrganization(trackdechets_public_org_info),
      true,
    );
  });

  it("should return false for organization with undefined activite principale", () => {
    assert.equal(isWasteManagementOrganization({} as Organization), false);
  });

  it("should return false for organization with null activite principale", () => {
    assert.equal(
      isWasteManagementOrganization({
        cached_libelle_activite_principale: null,
      } as unknown as Organization),
      false,
    );
  });
});
