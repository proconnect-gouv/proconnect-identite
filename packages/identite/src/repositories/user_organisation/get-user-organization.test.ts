//

import { LinkNotFoundError } from "#src/errors";
import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { getUserOrganizationFactory } from "./get-user-organization.js";

//

const getUserOrganization = getUserOrganizationFactory({ pg: pg as any });

suite("getUserOrganizationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should get the link between a user and an organization", async () => {
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

    const link = await getUserOrganization({
      organization_id: 1,
      user_id: 1,
    });

    assert.deepEqual(link, {
      created_at: new Date("4444-04-04"),
      has_been_greeted: false,
      is_external: false,
      organization_id: 1,
      updated_at: new Date("4444-04-04"),
      user_id: 1,
      verification_type: "domain_not_verified_yet",
      verified_at: null,
    });
  });

  test("❎ fail to find a link that does not exist", async () => {
    await assert.rejects(
      getUserOrganization({ organization_id: 42, user_id: 42 }),
      new LinkNotFoundError("Link not found"),
    );
  });
});
