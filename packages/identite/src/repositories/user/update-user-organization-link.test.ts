//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { updateUserOrganizationLinkFactory } from "./update-user-organization-link.js";

//

const updateUserOrganizationLink = updateUserOrganizationLinkFactory({
  pg: pg as any,
});

suite("updateUserOrganizationLink", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should update the user organization link", async () => {
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
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'Lion', 'El''Jonson', 'I', 'Primarque')
      ;
    `;
    await pg.sql`
      INSERT INTO users_organizations
        (user_id, organization_id, created_at, updated_at, is_external, verification_type, official_contact_email_verification_token, official_contact_email_verification_sent_at)
      VALUES
        (1, 1, '4444-04-04', '4444-04-04', false, 'no_verification_means_available', null, null)
      ;
    `;

    const user = await updateUserOrganizationLink(1, 1, {
      is_external: true,
    });
    assert.ok(user.is_external);
  });
});
