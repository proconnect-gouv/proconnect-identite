//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { findUserOrganizationFactory } from "./find-user-organization.js";

//

const findUserOrganization = findUserOrganizationFactory({
  pg: pg as any,
});

suite("findUserOrganizationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return undefined when the link does not exist", async () => {
    const link = await findUserOrganization({ organization_id: 1, user_id: 1 });

    assert.equal(link, undefined);
  });

  test("should return the link when it exists", async () => {
    await pg.sql`
      INSERT INTO organizations
        (cached_libelle, cached_nom_complet, id, siret, created_at, updated_at)
      VALUES
        ('Necron', 'Necrontyr', 1, '⚰️', '1967-12-19', '1967-12-19')
      ;
    `;
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;
    await pg.sql`
      INSERT INTO users_organizations
        (user_id, organization_id, created_at, updated_at, verification_type)
      VALUES
        (1, 1, '4444-04-04', '4444-04-04', 'domain_not_verified_yet')
      ;
    `;

    const link = await findUserOrganization({ organization_id: 1, user_id: 1 });

    assert.equal(link?.user_id, 1);
    assert.equal(link?.organization_id, 1);
  });
});
