//

import { getMembershipChangesByDomainVerification } from "#src/services/organization";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

const unverified_darkangels = [
  {
    email: "lion.eljonson@darkangels.world",
    verification_type: "no_validation_means_available",
  },
  {
    email: "cat.eljonson@darkangels.world",
    verification_type: "no_verification_means_for_entreprise_unipersonnelle",
  },
  {
    email: "tiger.eljonson@darkangels.world",
    verification_type: "no_verification_means_for_small_association",
  },
  {
    email: "wolf.eljonson@darkangels.world",
    verification_type: "no_verification_means_for_small_organization",
  },
  {
    email: "mouse.eljonson@darkangels.world",
    verification_type: "domain_not_verified_yet",
  },
];

const verified_darkangels = [
  {
    email: "luther@darkangels.world",
    verification_type: "organization_dirigeant",
  },
  { email: "azrael@darkangels.world", verification_type: "domain" },
  {
    email: "belial@darkangels.world",
    verification_type: "official_contact_email",
  },
];

const other_domains = [
  {
    email: "leman.russ@spacewolves.world",
    verification_type: "no_validation_means_available",
  },
  {
    email: "cypher@fallen.darkangels.world",
    verification_type: "no_validation_means_available",
  },
];

const members = [
  ...unverified_darkangels,
  ...verified_darkangels,
  ...other_domains,
];

describe("getMembershipChangesByDomainVerification", () => {
  it("should promote the unverified and super weak members of an approved domain", () => {
    assert.deepEqual(
      getMembershipChangesByDomainVerification({
        domain: "darkangels.world",
        members,
        verification_type: "verified",
      }),
      {
        kind: "domain_approved",
        promoted_members: unverified_darkangels,
        verification_type: "verified",
      },
    );
  });

  it("should remove every member of a refused domain, whatever their link", () => {
    assert.deepEqual(
      getMembershipChangesByDomainVerification({
        domain: "darkangels.world",
        members,
        verification_type: "refused",
      }),
      {
        kind: "domain_refused",
        removed_members: [...unverified_darkangels, ...verified_darkangels],
        verification_type: "refused",
      },
    );
  });
});
