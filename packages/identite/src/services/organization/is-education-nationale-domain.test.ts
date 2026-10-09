//

import { isEducationNationaleDomain } from "#src/services/organization";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("isEducationNationaleDomain", () => {
  ["zac-orleans.fr", "ac-bordeaux.fr.net", "ac-bordeaux.gouv.fr"].forEach(
    (domain) => {
      it("should return false for non educ nat domain", () => {
        assert.equal(isEducationNationaleDomain(domain), false);
      });
    },
  );
  ["ac-orleans-tours.fr", "ac-bordeaux.fr"].forEach((domain) => {
    it("should return true for educ nat domain", () => {
      assert.equal(isEducationNationaleDomain(domain), true);
    });
  });
});
