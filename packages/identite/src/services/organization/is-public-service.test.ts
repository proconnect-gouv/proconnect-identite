//

import type { Organization } from "@gouvfr-lasuite/proconnect.identite/types";
import {
  association_org_info,
  dinum_org_info,
  entreprise_unipersonnelle_org_info,
  lamalou_org_info,
  onf_org_info,
  trackdechets_public_org_info,
  whitelisted_org_info,
} from "#testing/seed/organizations";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPublicService } from "./is-public-service.js";

describe("isPublicService", () => {
  it("should return false for bad call", () => {
    assert.equal(isPublicService({} as Organization), false);
  });

  it("should return true for collectivite territoriale", () => {
    assert.equal(isPublicService(lamalou_org_info), true);
  });

  it("should return true for administration centrale", () => {
    assert.equal(isPublicService(dinum_org_info), true);
  });

  it("should return false for unipersonnelle organization", () => {
    assert.equal(isPublicService(entreprise_unipersonnelle_org_info), false);
  });

  it("should return false for association", () => {
    assert.equal(isPublicService(association_org_info), false);
  });

  it("should return true for établissement public à caractère industriel et commercial", () => {
    assert.equal(isPublicService(onf_org_info), true);
  });

  it("should return true for whitelisted établissement", () => {
    assert.equal(isPublicService(whitelisted_org_info), true);
  });

  it("should return true for public etablissement", () => {
    assert.equal(isPublicService(trackdechets_public_org_info), true);
  });
});