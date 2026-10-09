//

import { EmailDomainVerificationEnum } from "#src/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { check_join_preconditions } from "./check-join-preconditions.js";

//

const private_organization = {
  cached_categorie_juridique: "9220",
  cached_etat_administratif: "A",
  id: 42,
  siret: "83511518900010",
};

const public_organization = {
  cached_categorie_juridique: "7120",
  cached_etat_administratif: "A",
  id: 42,
  siret: "13002526500013",
};

const whitelisted_organization = {
  ...public_organization,
  siret: "11000201100044",
};

const nothing_matches = {
  certification_requested: false,
  domain: "example.com",
  organization: private_organization,
  organization_email_domains: [],
  pending_moderation: undefined,
  rejected_moderation: undefined,
  user_organizations: [{ id: 1 }],
};

describe("check_join_preconditions", () => {
  it("ok when nothing matches", () => {
    const actual = check_join_preconditions(nothing_matches);

    assert.deepEqual(actual, { kind: "ok" });
  });

  it("already_member", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      user_organizations: [{ id: 1 }, { id: 42 }],
    });

    assert.deepEqual(actual, { kind: "already_member" });
  });

  it("already_asked", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      pending_moderation: { id: 7 },
    });

    assert.deepEqual(actual, { kind: "already_asked", moderation_id: 7 });
  });

  it("moderation_rejected", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      rejected_moderation: { id: 8 },
    });

    assert.deepEqual(actual, { kind: "moderation_rejected", moderation_id: 8 });
  });

  it("domain_not_allowed", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      organization: whitelisted_organization,
    });

    assert.deepEqual(actual, { kind: "domain_not_allowed" });
  });

  it("ok for a whitelisted domain", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      domain: "finances.gouv.fr",
      organization: whitelisted_organization,
    });

    assert.deepEqual(actual, { kind: "ok" });
  });

  it("domain_refused", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      organization_email_domains: [
        {
          domain: "example.com",
          verification_type: EmailDomainVerificationEnum.enum.refused,
        },
      ],
    });

    assert.deepEqual(actual, { kind: "domain_refused" });
  });

  it("ok when another domain is refused", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      organization_email_domains: [
        {
          domain: "other.com",
          verification_type: EmailDomainVerificationEnum.enum.refused,
        },
      ],
    });

    assert.deepEqual(actual, { kind: "ok" });
  });

  it("ok when the domain is not refused", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      organization_email_domains: [
        {
          domain: "example.com",
          verification_type: EmailDomainVerificationEnum.enum.not_verified_yet,
        },
      ],
    });

    assert.deepEqual(actual, { kind: "ok" });
  });

  it("gouv_fr_forbidden_for_private_org", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      domain: "beta.gouv.fr",
    });

    assert.deepEqual(actual, { kind: "gouv_fr_forbidden_for_private_org" });
  });

  it("ok for a gouv.fr domain in a public organization", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      domain: "beta.gouv.fr",
      organization: public_organization,
    });

    assert.deepEqual(actual, { kind: "ok" });
  });

  it("pending_certification_dirigeant", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      certification_requested: true,
    });

    assert.deepEqual(actual, { kind: "pending_certification_dirigeant" });
  });

  it("already_member beats already_asked", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      pending_moderation: { id: 7 },
      user_organizations: [{ id: 42 }],
    });

    assert.deepEqual(actual, { kind: "already_member" });
  });

  it("already_asked beats moderation_rejected", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      pending_moderation: { id: 7 },
      rejected_moderation: { id: 8 },
    });

    assert.deepEqual(actual, { kind: "already_asked", moderation_id: 7 });
  });

  it("moderation_rejected beats domain_not_allowed", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      organization: whitelisted_organization,
      rejected_moderation: { id: 8 },
    });

    assert.deepEqual(actual, { kind: "moderation_rejected", moderation_id: 8 });
  });

  it("domain_not_allowed beats domain_refused", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      organization: whitelisted_organization,
      organization_email_domains: [
        {
          domain: "example.com",
          verification_type: EmailDomainVerificationEnum.enum.refused,
        },
      ],
    });

    assert.deepEqual(actual, { kind: "domain_not_allowed" });
  });

  it("domain_refused beats gouv_fr_forbidden_for_private_org", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      domain: "beta.gouv.fr",
      organization_email_domains: [
        {
          domain: "beta.gouv.fr",
          verification_type: EmailDomainVerificationEnum.enum.refused,
        },
      ],
    });

    assert.deepEqual(actual, { kind: "domain_refused" });
  });

  it("gouv_fr_forbidden_for_private_org beats pending_certification_dirigeant", () => {
    const actual = check_join_preconditions({
      ...nothing_matches,
      certification_requested: true,
      domain: "beta.gouv.fr",
    });

    assert.deepEqual(actual, { kind: "gouv_fr_forbidden_for_private_org" });
  });
});
