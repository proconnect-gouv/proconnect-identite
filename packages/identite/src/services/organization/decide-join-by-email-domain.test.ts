//

import type { EmailDomainVerificationType } from "#src/types";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decide_join_by_email_domain } from "./decide-join-by-email-domain.js";

//

const email_domain = ({
  domain = "example.gouv.fr",
  verification_type,
}: {
  domain?: string;
  verification_type: EmailDomainVerificationType;
}) => ({ domain, verification_type });

describe("decide_join_by_email_domain", () => {
  it("verified domain links domain", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: false,
      domain: "example.gouv.fr",
      organization_email_domains: [
        email_domain({ verification_type: "verified" }),
      ],
    });

    assert.deepEqual(actual, { is_external: false, kind: "link_domain" });
  });

  it("official_contact domain links domain", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: false,
      domain: "example.gouv.fr",
      organization_email_domains: [
        email_domain({ verification_type: "official_contact" }),
      ],
    });

    assert.deepEqual(actual, { is_external: false, kind: "link_domain" });
  });

  it("trackdechets_postal_mail domain links domain", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: false,
      domain: "example.gouv.fr",
      organization_email_domains: [
        email_domain({ verification_type: "trackdechets_postal_mail" }),
      ],
    });

    assert.deepEqual(actual, { is_external: false, kind: "link_domain" });
  });

  it("external domain links domain as external", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: false,
      domain: "example.gouv.fr",
      organization_email_domains: [
        email_domain({ verification_type: "external" }),
      ],
    });

    assert.deepEqual(actual, { is_external: true, kind: "link_domain" });
  });

  it("approved domain beats bypass", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: true,
      domain: "example.gouv.fr",
      organization_email_domains: [
        email_domain({ verification_type: "verified" }),
      ],
    });

    assert.deepEqual(actual, { is_external: false, kind: "link_domain" });
  });

  it("bypass with no domain", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: true,
      domain: "example.gouv.fr",
      organization_email_domains: [],
    });

    assert.deepEqual(actual, { kind: "bypassed" });
  });

  it("bypass beats not_verified_yet", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: true,
      domain: "example.gouv.fr",
      organization_email_domains: [
        email_domain({ verification_type: "not_verified_yet" }),
      ],
    });

    assert.deepEqual(actual, { kind: "bypassed" });
  });

  it("not_verified_yet domain", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: false,
      domain: "example.gouv.fr",
      organization_email_domains: [
        email_domain({ verification_type: "not_verified_yet" }),
      ],
    });

    assert.deepEqual(actual, { kind: "domain_not_verified_yet" });
  });

  it("refused domain", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: false,
      domain: "example.gouv.fr",
      organization_email_domains: [
        email_domain({ verification_type: "refused" }),
      ],
    });

    assert.deepEqual(actual, { kind: "unable_to_auto_join" });
  });

  it("blacklisted domain", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: false,
      domain: "example.gouv.fr",
      organization_email_domains: [
        email_domain({ verification_type: "blacklisted" }),
      ],
    });

    assert.deepEqual(actual, { kind: "unable_to_auto_join" });
  });

  it("approved domain for another domain", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: false,
      domain: "example.gouv.fr",
      organization_email_domains: [
        email_domain({
          domain: "other.gouv.fr",
          verification_type: "verified",
        }),
        email_domain({
          domain: "sub.example.gouv.fr",
          verification_type: "not_verified_yet",
        }),
      ],
    });

    assert.deepEqual(actual, { kind: "unable_to_auto_join" });
  });

  it("only exact domain matches", () => {
    const actual = decide_join_by_email_domain({
      bypass_moderation: false,
      domain: "example.gouv.fr",
      organization_email_domains: [
        email_domain({
          domain: "other.gouv.fr",
          verification_type: "verified",
        }),
        email_domain({ verification_type: "not_verified_yet" }),
      ],
    });

    assert.deepEqual(actual, { kind: "domain_not_verified_yet" });
  });
});
