//

import { oalFromVerificationType } from "#src/services/assurance-levels";
import type { LinkType } from "#src/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("oalFromVerificationType", () => {
  const cases: [LinkType, string][] = [
    ["domain", "moderated"],
    ["domain_not_verified_yet", "moderated"],
    ["no_validation_means_available", "declared"],
    ["organization_dirigeant", "certified"],
  ];

  for (const [verification_type, expected] of cases) {
    it(`should return ${expected} for ${verification_type}`, () => {
      assert.equal(oalFromVerificationType(verification_type), expected);
    });
  }
});
