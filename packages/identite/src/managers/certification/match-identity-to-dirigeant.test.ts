//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { match_identity_to_dirigeant } from "./match-identity-to-dirigeant.js";

//

const identity = {
  birthcountry: null,
  birthdate: new Date("1946-08-17"),
  birthplace: "75001",
  family_name: "Bernard",
  gender: "male" as const,
  given_name: "Stéphane",
};

describe("match_identity_to_dirigeant", () => {
  it("returns no_candidates for an empty dirigeants list", () => {
    assert.deepEqual(match_identity_to_dirigeant(identity, []), {
      kind: "no_candidates",
    });
  });

  it("returns exact_match for a score of 5", () => {
    const result = match_identity_to_dirigeant(identity, [identity]);
    assert.equal(result.kind, "exact_match");
  });

  it("returns close_match for a score of 4", () => {
    const dirigeant = { ...identity, family_name: "DuMoulin" };
    const result = match_identity_to_dirigeant(identity, [dirigeant]);
    assert.equal(result.kind, "close_match");
  });

  it("returns close_match for a score of 3", () => {
    const dirigeant = {
      ...identity,
      family_name: "DuMoulin",
      given_name: "Robert",
    };
    const result = match_identity_to_dirigeant(identity, [dirigeant]);
    assert.equal(result.kind, "close_match");
  });

  it("returns below_threshold for a score under 3", () => {
    const dirigeant = {
      ...identity,
      family_name: "DuMoulin",
      given_name: "Robert",
      gender: "female" as const,
    };
    const result = match_identity_to_dirigeant(identity, [dirigeant]);
    assert.equal(result.kind, "below_threshold");
  });

  it("picks the highest-scoring candidate among several", () => {
    const weak = { ...identity, family_name: "DuMoulin", given_name: "Robert" };
    const result = match_identity_to_dirigeant(identity, [weak, identity]);
    assert.equal(result.kind, "exact_match");
  });
});
