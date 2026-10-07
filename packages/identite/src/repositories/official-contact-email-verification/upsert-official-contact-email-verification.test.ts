//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { upsertOfficialContactEmailVerificationFactory } from "./upsert-official-contact-email-verification.js";

//

const upsertOfficialContactEmailVerification =
  upsertOfficialContactEmailVerificationFactory({ pg: pg as any });

suite("upsertOfficialContactEmailVerificationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should insert an official contact email verification", async () => {
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

    const { created_at, updated_at, ...verification } =
      await upsertOfficialContactEmailVerification({
        organization_id: 1,
        sent_at: new Date("4444-04-04"),
        token: "666666",
        user_id: 1,
      });

    assert.deepEqual(verification, {
      organization_id: 1,
      sent_at: new Date("4444-04-04"),
      token: "666666",
      user_id: 1,
    });
    assert.ok(created_at instanceof Date);
    assert.deepEqual(created_at, updated_at);
  });

  test("should insert an official contact email verification without token nor sent_at", async () => {
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

    const { created_at, updated_at, ...verification } =
      await upsertOfficialContactEmailVerification({
        organization_id: 1,
        sent_at: null,
        token: null,
        user_id: 1,
      });

    assert.deepEqual(verification, {
      organization_id: 1,
      sent_at: null,
      token: null,
      user_id: 1,
    });
    assert.ok(created_at instanceof Date);
    assert.deepEqual(created_at, updated_at);
  });

  test("should update the existing official contact email verification", async () => {
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
        (1, 1, '111111', '1967-12-19', '1967-12-19', '1967-12-19')
      ;
    `;

    const { created_at, updated_at, ...verification } =
      await upsertOfficialContactEmailVerification({
        organization_id: 1,
        sent_at: new Date("4444-04-04"),
        token: "666666",
        user_id: 1,
      });

    assert.deepEqual(verification, {
      organization_id: 1,
      sent_at: new Date("4444-04-04"),
      token: "666666",
      user_id: 1,
    });
    assert.deepEqual(created_at, new Date("1967-12-19"));
    assert.ok(updated_at > new Date("1967-12-19"));

    const { rows } = await pg.sql`
      SELECT count(*)::int AS count FROM official_contact_email_verifications;
    `;
    assert.deepEqual(rows, [{ count: 1 }]);
  });

  test("❎ fail to insert a verification for an unknown user", async () => {
    await pg.sql`
      INSERT INTO organizations
        (cached_libelle, cached_nom_complet, id, siret, created_at, updated_at)
      VALUES
        ('Necron', 'Necrontyr', 1, '⚰️', '1967-12-19', '1967-12-19')
      ;
    `;

    await assert.rejects(
      upsertOfficialContactEmailVerification({
        organization_id: 1,
        sent_at: null,
        token: "666666",
        user_id: 42,
      }),
      `error: insert or update on table "official_contact_email_verifications" violates foreign key constraint "official_contact_email_verifications_user_id_fkey"`,
    );
  });

  test("❎ fail to insert a verification for an unknown organization", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;

    await assert.rejects(
      upsertOfficialContactEmailVerification({
        organization_id: 42,
        sent_at: null,
        token: "666666",
        user_id: 1,
      }),
      `error: insert or update on table "official_contact_email_verifications" violates foreign key constraint "official_contact_email_verifications_organization_id_fkey"`,
    );
  });
});
