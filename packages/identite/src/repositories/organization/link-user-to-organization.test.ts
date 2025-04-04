import { emptyDatabase, migrate, pg } from "#testing";
import { before, beforeEach, mock, suite, test } from "node:test";
import { linkUserToOrganizationFactory } from "./link-user-to-organization.js";

//

const linkUserToOrganization = linkUserToOrganizationFactory({ pg: pg as any });

suite("linkUserToOrganizationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);
  before(() => {
    mock.timers.enable({ apis: ["Date"], now: new Date("4444-04-04") });
  });

  test("should link user to organization", async (t) => {
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

    const userOrganizationLink = await linkUserToOrganization({
      organization_id: 1,
      user_id: 1,
      verification_type: "bypassed",
    });

    t.assert.snapshot(userOrganizationLink);
  });

  test("should mark a user as executive", async (t) => {
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

    const userOrganizationLink = await linkUserToOrganization({
      organization_id: 1,
      user_id: 1,
      verification_type: "bypassed",
      is_dirigeant: true,
    });

    t.assert.snapshot(userOrganizationLink);
  });
});
