//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { getUsersByOrganizationFactory } from "./get-users-by-organization.js";

//

const getUsersByOrganization = getUsersByOrganizationFactory({ pg: pg as any });

describe("getUsersByOrganizationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should find users by organization id", async (t) => {
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
        (user_id, organization_id, created_at, updated_at, is_external, verification_type, official_contact_email_verification_token, official_contact_email_verification_sent_at)
      VALUES
        (1, 1, '4444-04-04', '4444-04-04', false, 'no_verification_means_available', null, null)
      ;
    `;

    const user = await getUsersByOrganization(1);

    t.assert.snapshot(user);
  });

  it("❎ fail to find users for unknown organization id", async () => {
    const user = await getUsersByOrganization(42);
    assert.deepEqual(user, []);
  });
});
