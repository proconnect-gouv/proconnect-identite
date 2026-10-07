//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { findOfficialContactEmailVerificationFactory } from "./find-official-contact-email-verification.js";

//

const findOfficialContactEmailVerification =
  findOfficialContactEmailVerificationFactory({ pg: pg as any });

suite("findOfficialContactEmailVerificationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return undefined when not found", async () => {
    const verification = await findOfficialContactEmailVerification({
      organization_id: 42,
      user_id: 42,
    });

    assert.equal(verification, undefined);
  });

  test("should find the official contact email verification", async () => {
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
        (1, 1, '666666', '4444-04-04', '4444-04-01', '4444-04-02')
      ;
    `;

    const verification = await findOfficialContactEmailVerification({
      organization_id: 1,
      user_id: 1,
    });

    assert.deepEqual(verification, {
      created_at: new Date("4444-04-01"),
      organization_id: 1,
      sent_at: new Date("4444-04-04"),
      token: "666666",
      updated_at: new Date("4444-04-02"),
      user_id: 1,
    });
  });

  test("should find an official contact email verification without token nor sent_at", async () => {
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
        (user_id, organization_id, created_at, updated_at)
      VALUES
        (1, 1, '4444-04-01', '4444-04-02')
      ;
    `;

    const verification = await findOfficialContactEmailVerification({
      organization_id: 1,
      user_id: 1,
    });

    assert.deepEqual(verification, {
      created_at: new Date("4444-04-01"),
      organization_id: 1,
      sent_at: null,
      token: null,
      updated_at: new Date("4444-04-02"),
      user_id: 1,
    });
  });

  test("should find the verification of the given user and organization only", async () => {
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

    const verification = await findOfficialContactEmailVerification({
      organization_id: 2,
      user_id: 1,
    });

    assert.equal(verification?.token, "222222");
  });
});
