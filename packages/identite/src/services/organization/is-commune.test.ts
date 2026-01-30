//

import { isCommune } from "#src/services/organization";
import type { Organization } from "#src/types";
import {
  communaute_de_communes_org_info,
  dinum_org_info,
  lamalou_org_info,
} from "#testing/seed/organizations";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("isCommune", () => {
  it("should return false for bad call", () => {
    assert.equal(isCommune({} as Organization), false);
  });

  it("should return true for commune", () => {
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
