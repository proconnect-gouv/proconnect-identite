//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { deleteUserOrganizationFactory } from "./delete-user-organization.js";

//

const deleteUserOrganization = deleteUserOrganizationFactory({ pg: pg as any });

suite("deleteUserOrganizationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return true when the link exists", async () => {
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

    const result = await deleteUserOrganization({
      user_id: 1,
      organization_id: 1,
    });

    assert.equal(result, true);
  });

  test("should return false when the link does not exist", async () => {
    const result = await deleteUserOrganization({
      user_id: 999,
      organization_id: 999,
    });

    assert.equal(result, false);
  });
});
