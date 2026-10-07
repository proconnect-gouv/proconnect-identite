//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { deleteOfficialContactEmailVerificationFactory } from "./delete-official-contact-email-verification.js";

//

const deleteOfficialContactEmailVerification =
  deleteOfficialContactEmailVerificationFactory({ pg: pg as any });

suite("deleteOfficialContactEmailVerificationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return true when the verification exists", async () => {
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
      INSERT INTO official_contact_email_verifications
        (user_id, organization_id, token, sent_at, created_at, updated_at)
      VALUES
        (1, 1, '666666', '4444-04-04', '4444-04-04', '4444-04-04')
      ;
    `;

    const result = await deleteOfficialContactEmailVerification({
      organization_id: 1,
      user_id: 1,
    });

    assert.equal(result, true);

    const { rows } = await pg.sql`
      SELECT count(*)::int AS count FROM official_contact_email_verifications;
    `;
    assert.deepEqual(rows, [{ count: 0 }]);
  });

  test("should return false when the verification does not exist", async () => {
    const result = await deleteOfficialContactEmailVerification({
      organization_id: 42,
      user_id: 42,
    });

    assert.equal(result, false);
  });

  test("should only delete the verification of the given user and organization", async () => {
    await pg.sql`
      INSERT INTO organizations
        (cached_libelle, cached_nom_complet, id, siret, created_at, updated_at)
      VALUES
        ('Necron', 'Necrontyr', 1, '⚰️', '1967-12-19', '1967-12-19'),
        ('Ultramar', 'Ultramarines', 2, '🔵', '1967-12-19', '1967-12-19')
      ;
    `;
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque'),
        (2, 'roboute.guilliman@ultramarines.world', '4444-04-04', '4444-04-04', 'roboute', 'guilliman', 'xiii', 'primarque')
      ;
    `;
    await pg.sql`
      INSERT INTO official_contact_email_verifications
        (user_id, organization_id, token, sent_at, created_at, updated_at)
      VALUES
        (1, 1, '111111', '4444-04-04', '4444-04-04', '4444-04-04'),
        (1, 2, '222222', '4444-04-04', '4444-04-04', '4444-04-04'),
        (2, 1, '333333', '4444-04-04', '4444-04-04', '4444-04-04')
      ;
    `;

    const result = await deleteOfficialContactEmailVerification({
      organization_id: 1,
      user_id: 1,
    });

    assert.equal(result, true);

    const { rows } = await pg.sql`
      SELECT user_id, organization_id, token
      FROM official_contact_email_verifications
      ORDER BY user_id, organization_id;
    `;
    assert.deepEqual(rows, [
      { user_id: 1, organization_id: 2, token: "222222" },
      { user_id: 2, organization_id: 1, token: "333333" },
    ]);
  });
});
