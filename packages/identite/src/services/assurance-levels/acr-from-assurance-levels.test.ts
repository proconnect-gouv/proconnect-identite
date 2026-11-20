//

import {
  acrFromAssuranceLevels,
  type AssuranceLevels,
} from "#src/services/assurance-levels";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("acrFromAssuranceLevels", () => {
  const cases: [AssuranceLevels, string | null][] = [
    [{ aal: "single_factor", ial: "declared", oal: "declared" }, null],
    [{ aal: "single_factor", ial: "declared", oal: "moderated" }, "eidas0"],
    [{ aal: "single_factor", ial: "declared", oal: "certified" }, null],
    [{ aal: "single_factor", ial: "low", oal: "declared" }, "eidas0"],
    [{ aal: "single_factor", ial: "low", oal: "moderated" }, "eidas1"],
    [{ aal: "single_factor", ial: "low", oal: "certified" }, "eidas1"],
    [{ aal: "multi_factor", ial: "declared", oal: "declared" }, null],
    [{ aal: "multi_factor", ial: "declared", oal: "moderated" }, "eidas0-mfa"],
    [{ aal: "multi_factor", ial: "declared", oal: "certified" }, null],
    [{ aal: "multi_factor", ial: "low", oal: "declared" }, "eidas0-mfa"],
    [{ aal: "multi_factor", ial: "low", oal: "moderated" }, "eidas1-mfa"],
    [{ aal: "multi_factor", ial: "low", oal: "certified" }, "eidas1-mfa"],
  ];

  for (const [levels, expected] of cases) {
    it(`should return ${expected} for ${JSON.stringify(levels)}`, () => {
      assert.equal(acrFromAssuranceLevels(levels), expected);
    });
  }
});
