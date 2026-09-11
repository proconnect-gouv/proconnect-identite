//

import { NotFoundError } from "#src/errors";
import { context, emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { markDomainAsVerifiedFactory } from "./mark-domain-as-verified.js";

//

const markDomainAsVerified = markDomainAsVerifiedFactory(context);

describe("markDomainAsVerified", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should update organization members", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, cached_libelle, cached_nom_complet, siret, created_at, updated_at)
      VALUES
        (1, 'Dark Angels', 'Dark Angels Legion', '🦁', '4444-04-04', '4444-04-04')
      ;
    `;
    await pg.sql`
      INSERT INTO users (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'Lion', 'El''Jonson', '0', 'Primarque')
    `;
    await pg.sql`
      INSERT INTO users_organizations
        (user_id, organization_id, created_at, updated_at, is_external, verification_type, needs_official_contact_email_verification, official_contact_email_verification_token, official_contact_email_verification_sent_at)
      VALUES
        (1, 1, '4444-04-04', '4444-04-04', false, 'no_verification_means_for_entreprise_unipersonnelle', false, null, null)
      ;
    `;
    await pg.sql`
      INSERT INTO email_domains (organization_id, domain, verification_type)
      VALUES (1, 'darkangels.world', 'not_verified_yet')
    `;

    await markDomainAsVerified({
      domain: "darkangels.world",
      domain_verification_type: "verified",
      organization_id: 1,
    });

    // user verification_type should be updated to "domain"
    const { rows: userLinks } = await pg.sql`
      SELECT user_id, verification_type
      FROM users_organizations
      WHERE organization_id = 1
    `;
    assert.deepEqual(userLinks, [{ user_id: 1, verification_type: "domain" }]);

    // old email_domain records should be replaced with "verified"
    const { rows: emailDomains } = await pg.sql`
      SELECT domain, verification_type
      FROM email_domains
      WHERE organization_id = 1
      ORDER BY verification_type
    `;
    assert.deepEqual(emailDomains, [
      { domain: "darkangels.world", verification_type: "verified" },
    ]);
  });

  it("❎ throws NotFoundError for unknown organization", async () => {
    await assert.rejects(
      markDomainAsVerified({
        domain: "darkangels.world",
        domain_verification_type: "verified",
        organization_id: 999,
      }),
      new NotFoundError(""),
    );
  });

  it("should reject a pending domain", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, cached_libelle, cached_nom_complet, siret, created_at, updated_at)
      VALUES
        (1, 'Black Legion', 'Black Legion Warband', '👁️', '4444-04-04', '4444-04-04')
      ;
    `;
    await pg.sql`
      INSERT INTO email_domains (organization_id, domain, verification_type)
      VALUES (1, 'blacklegion.world', 'not_verified_yet')
    `;

    await markDomainAsVerified({
      domain: "blacklegion.world",
      domain_verification_type: "refused",
      organization_id: 1,
    });

    const { rows: emailDomains } = await pg.sql`
      SELECT domain, verification_type
      FROM email_domains
      WHERE organization_id = 1
      ORDER BY verification_type
    `;
    assert.deepEqual(emailDomains, [
      { domain: "blacklegion.world", verification_type: "refused" },
    ]);
  });

  it("rejecting a domain should not touch an existing approval for the same domain", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, cached_libelle, cached_nom_complet, siret, created_at, updated_at)
      VALUES
        (1, 'Thousand Sons', 'Thousand Sons Legion', '📖', '4444-04-04', '4444-04-04')
      ;
    `;
    await pg.sql`
      INSERT INTO email_domains (organization_id, domain, verification_type)
      VALUES (1, 'thousandsons.world', 'verified')
    `;

    await markDomainAsVerified({
      domain: "thousandsons.world",
      domain_verification_type: "refused",
      organization_id: 1,
    });

    const { rows: emailDomains } = await pg.sql`
      SELECT domain, verification_type
      FROM email_domains
      WHERE organization_id = 1
      ORDER BY verification_type
    `;
    assert.deepEqual(emailDomains, [
      { domain: "thousandsons.world", verification_type: "refused" },
      { domain: "thousandsons.world", verification_type: "verified" },
    ]);
  });

  it("rejecting a domain should not demote an already domain-verified member", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, cached_libelle, cached_nom_complet, siret, created_at, updated_at)
      VALUES
        (1, 'Word Bearers', 'Word Bearers Legion', '🔥', '4444-04-04', '4444-04-04')
      ;
    `;
    await pg.sql`
      INSERT INTO users (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES (1, 'lorgar.aurelian@wordbearers.world', '4444-04-04', '4444-04-04', 'Lorgar', 'Aurelian', '0', 'Primarque')
    `;
    await pg.sql`
      INSERT INTO users_organizations
        (user_id, organization_id, created_at, updated_at, is_external, verification_type, needs_official_contact_email_verification, official_contact_email_verification_token, official_contact_email_verification_sent_at)
      VALUES
        (1, 1, '4444-04-04', '4444-04-04', false, 'domain', false, null, null)
      ;
    `;
    await pg.sql`
      INSERT INTO email_domains (organization_id, domain, verification_type)
      VALUES (1, 'wordbearers.world', 'not_verified_yet')
    `;

    await markDomainAsVerified({
      domain: "wordbearers.world",
      domain_verification_type: "refused",
      organization_id: 1,
    });

    const { rows: userLinks } = await pg.sql`
      SELECT user_id, verification_type
      FROM users_organizations
      WHERE organization_id = 1
    `;
    assert.deepEqual(userLinks, [{ user_id: 1, verification_type: "domain" }]);
  });

  it("approving a domain should only promote eligible member links", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, cached_libelle, cached_nom_complet, siret, created_at, updated_at)
      VALUES
        (1, 'Emperor''s Children', 'Emperor''s Children Legion', '🎭', '4444-04-04', '4444-04-04')
      ;
    `;
    await pg.sql`
      INSERT INTO users (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'fulgrim@emperorschildren.world', '4444-04-04', '4444-04-04', 'Fulgrim', 'Primarque', '0', 'Primarque'),
        (2, 'lucius@emperorschildren.world', '4444-04-04', '4444-04-04', 'Lucius', 'The Eternal', '0', 'Champion')
      ;
    `;
    await pg.sql`
      INSERT INTO users_organizations
        (user_id, organization_id, created_at, updated_at, is_external, verification_type, needs_official_contact_email_verification, official_contact_email_verification_token, official_contact_email_verification_sent_at)
      VALUES
        (1, 1, '4444-04-04', '4444-04-04', false, 'no_verification_means_for_entreprise_unipersonnelle', false, null, null),
        (2, 1, '4444-04-04', '4444-04-04', false, 'organization_dirigeant', false, null, null)
      ;
    `;
    await pg.sql`
      INSERT INTO email_domains (organization_id, domain, verification_type)
      VALUES (1, 'emperorschildren.world', 'not_verified_yet')
    `;

    await markDomainAsVerified({
      domain: "emperorschildren.world",
      domain_verification_type: "verified",
      organization_id: 1,
    });

    const { rows: userLinks } = await pg.sql`
      SELECT user_id, verification_type
      FROM users_organizations
      WHERE organization_id = 1
      ORDER BY user_id
    `;
    assert.deepEqual(userLinks, [
      { user_id: 1, verification_type: "domain" },
      { user_id: 2, verification_type: "organization_dirigeant" },
    ]);
  });
});
