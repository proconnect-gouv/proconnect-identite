//

import { getMemberIdsPromotedByDomain } from "#src/services/organization";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

describe("getMemberIdsPromotedByDomain", () => {
  it("should promote unverified and super weak members of the domain", () => {
    assert.deepEqual(
      getMemberIdsPromotedByDomain({
        domain: "darkangels.world",
        members: [
          {
            email: "lion.eljonson@darkangels.world",
            id: 1,
            verification_type: "no_validation_means_available",
          },
          {
            email: "cat.eljonson@darkangels.world",
            id: 2,
            verification_type:
              "no_verification_means_for_entreprise_unipersonnelle",
          },
          {
            email: "tiger.eljonson@darkangels.world",
            id: 3,
            verification_type: "no_verification_means_for_small_association",
          },
          {
            email: "wolf.eljonson@darkangels.world",
            id: 4,
            verification_type: "no_verification_means_for_small_organization",
          },
          {
            email: "mouse.eljonson@darkangels.world",
            id: 5,
            verification_type: "domain_not_verified_yet",
          },
        ],
      }),
      [1, 2, 3, 4, 5],
    );
  });

  it("should not promote members of another domain", () => {
    assert.deepEqual(
      getMemberIdsPromotedByDomain({
        domain: "darkangels.world",
        members: [
          {
            email: "foo@bar.world",
            id: 1,
            verification_type: "no_validation_means_available",
          },
          {
            email: "luther@sub.darkangels.world",
            id: 2,
            verification_type: "no_validation_means_available",
          },
        ],
      }),
      [],
    );
  });

  it("should not promote members with a verified link", () => {
    assert.deepEqual(
      getMemberIdsPromotedByDomain({
        domain: "darkangels.world",
        members: [
          {
            email: "lion.eljonson@darkangels.world",
            id: 1,
            verification_type: "organization_dirigeant",
          },
          {
            email: "azrael@darkangels.world",
            id: 2,
            verification_type: "domain",
          },
          {
            email: "belial@darkangels.world",
            id: 3,
            verification_type: "official_contact_email",
          },
        ],
      }),
      [],
    );
  });

  it("should not promote anyone without members", () => {
    assert.deepEqual(
      getMemberIdsPromotedByDomain({ domain: "darkangels.world", members: [] }),
      [],
    );
  });
});
