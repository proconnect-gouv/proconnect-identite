//

import { isWasteManagementOrganization } from "#src/services/organization";
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
});
