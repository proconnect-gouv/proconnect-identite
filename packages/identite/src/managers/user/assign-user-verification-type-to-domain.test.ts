//

import { context, emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { assignUserVerificationTypeToDomainFactory } from "./assign-user-verification-type-to-domain.js";

//

const assignUserVerificationTypeToDomain =
  assignUserVerificationTypeToDomainFactory(context);

describe("assignUserVerificationTypeToDomain", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should update some organization members", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, cached_libelle, cached_nom_complet, siret, created_at, updated_at)
      VALUES
        (1, 'Dark Angels', 'Dark Angels Legion', '🦁', '4444-04-04', '4444-04-04')
      ;
    `;
    // user from a different domain — should not be updated
    await pg.sql`
      INSERT INTO users (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES (1, 'foo@bar.world', '4444-04-04', '4444-04-04', 'Foo', 'Bar', '0', 'None')
    `;
    // user matching domain but already "verified" — should not be updated
    await pg.sql`
      INSERT INTO users (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES (2, 'foo@darkangels.world', '4444-04-04', '4444-04-04', 'Foo', 'DA', '0', 'None')
    `;
    // user with no_validation_means_available — should be updated
    await pg.sql`
      INSERT INTO users (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES (3, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'Lion', 'El''Jonson', '0', 'Primarque')
    `;
    // user with no_verification_means_for_entreprise_unipersonnelle — should be updated
    await pg.sql`
      INSERT INTO users (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES (4, 'cat.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'Cat', 'El''Jonson', '0', 'Scout')
    `;
    // user with no_verification_means_for_small_association — should be updated
    await pg.sql`
      INSERT INTO users (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES (5, 'tiger.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'Tiger', 'El''Jonson', '0', 'Scout')
    `;
    // user with domain_not_verified_yet — should be updated
    await pg.sql`
      INSERT INTO users (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES (6, 'mouse.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'Mouse', 'El''Jonson', '0', 'Scout')
    `;

    // link all users to the organization
    await pg.sql`
      INSERT INTO users_organizations
        (user_id, organization_id, created_at, updated_at, is_external, verification_type, needs_official_contact_email_verification, official_contact_email_verification_token, official_contact_email_verification_sent_at)
      VALUES
        (1, 1, '4444-04-04', '4444-04-04', false, 'no_validation_means_available', false, null, null),
        (2, 1, '4444-04-04', '4444-04-04', false, 'verified', false, null, null),
        (3, 1, '4444-04-04', '4444-04-04', false, 'no_validation_means_available', false, null, null),
        (4, 1, '4444-04-04', '4444-04-04', false, 'no_verification_means_for_entreprise_unipersonnelle', false, null, null),
        (5, 1, '4444-04-04', '4444-04-04', false, 'no_verification_means_for_small_association', false, null, null),
        (6, 1, '4444-04-04', '4444-04-04', false, 'domain_not_verified_yet', false, null, null)
      ;
    `;

    await assignUserVerificationTypeToDomain(1, "darkangels.world");

    // verify that the 4 matching users were updated to "domain"
    const { rows } = await pg.sql`
      SELECT user_id, verification_type
      FROM users_organizations
      WHERE organization_id = 1
      ORDER BY user_id
    `;

    assert.deepEqual(rows, [
      { user_id: 1, verification_type: "no_validation_means_available" }, // different domain
      { user_id: 2, verification_type: "verified" }, // already verified
      { user_id: 3, verification_type: "domain" },
      { user_id: 4, verification_type: "domain" },
      { user_id: 5, verification_type: "domain" },
      { user_id: 6, verification_type: "domain" },
    ]);
  });

  it("❎ should update nothing if no organization members", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, cached_libelle, cached_nom_complet, siret, created_at, updated_at)
      VALUES
        (1, 'Empty', 'Empty Org', '🫥', '4444-04-04', '4444-04-04')
      ;
    `;

    await assignUserVerificationTypeToDomain(1, "darkangels.world");

    const { rows } = await pg.sql`
      SELECT * FROM users_organizations WHERE organization_id = 1
    `;
    assert.deepEqual(rows, []);
  });
});
