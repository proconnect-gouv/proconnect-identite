//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { getUsersByOrganizationFactory } from "./get-users-by-organization.js";

//

const getUsersByOrganization = getUsersByOrganizationFactory({ pg: pg as any });

suite("getUsersByOrganizationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should find users by organization id", async () => {
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
        (user_id, organization_id, created_at, updated_at, is_external, verification_type, needs_official_contact_email_verification, official_contact_email_verification_token, official_contact_email_verification_sent_at)
      VALUES
        (1, 1, '4444-04-04', '4444-04-04', false, 'no_verification_means_available', false, null, null)
      ;
    `;

    const user = await getUsersByOrganization(1);

    assert.deepEqual(user, [
      {
        created_at: new Date("4444-04-04"),
        current_challenge: null,
        email_verified_at: null,
        email_verified: false,
        email: "lion.eljonson@darkangels.world",
        encrypted_password: "",
        encrypted_totp_key: null,
        family_name: "el'jonson",
        force_2fa: false,
        given_name: "lion",
        has_been_greeted: false,
        id: 1,
        is_external: false,
        job: "primarque",
        last_sign_in_at: null,
        magic_link_sent_at: null,
        magic_link_token: null,
        needs_inclusionconnect_onboarding_help: false,
        needs_inclusionconnect_welcome_page: false,
        needs_official_contact_email_verification: false,
        official_contact_email_verification_sent_at: null,
        official_contact_email_verification_token: null,
        phone_number: "i",
        reset_password_sent_at: null,
        reset_password_token: null,
        sign_in_count: 0,
        totp_key_verified_at: null,
        updated_at: new Date("4444-04-04"),
        verification_type: "no_verification_means_available",
        verify_email_sent_at: null,
        verify_email_token: null,
      },
    ]);
  });

  test("❎ fail to find users for unknown organization id", async () => {
    const user = await getUsersByOrganization(42);
    assert.deepEqual(user, []);
  });
});
