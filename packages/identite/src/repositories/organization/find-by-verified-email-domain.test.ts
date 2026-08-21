//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { findByVerifiedEmailDomainFactory } from "./find-by-verified-email-domain.js";

//

const findByVerifiedEmailDomain = findByVerifiedEmailDomainFactory({
  pg: pg as any,
});

suite("findByVerifiedEmailDomainFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return empty array when no organization matches the domain", async () => {
    const organizations = await findByVerifiedEmailDomain("absent.world");

    assert.deepEqual(organizations, []);
  });

  test("should return matching organization with member_count", async () => {
    await pg.sql`
      INSERT INTO organizations
        (cached_libelle, cached_nom_complet, id, siret, created_at, updated_at, cached_est_active)
      VALUES
        ('Necron', 'Necrontyr', 1, '⚰️', '1967-12-19', '1967-12-19', 'true')
      ;
    `;
    await pg.sql`
      INSERT INTO email_domains
        (organization_id, domain, verification_type, created_at, updated_at)
      VALUES
        (1, 'darkangels.world', 'verified', '4444-04-04', '4444-04-04')
      ;
    `;

    const organizations = await findByVerifiedEmailDomain("darkangels.world");

    assert.equal(organizations.length, 1);
    assert.equal(organizations[0]?.id, 1);
    assert.equal(organizations[0]?.member_count, 0);
  });
});
