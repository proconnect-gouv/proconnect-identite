//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { findByUserIdFactory } from "./find-by-user-id.js";

//

const findByUserId = findByUserIdFactory({ pg: pg as any });

suite("findByUserIdFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);
  beforeEach(seed);

  test("should return empty array when user has no organizations", async () => {
    const organizations = await findByUserId(42);
    assert.deepEqual(organizations, []);
  });

  test("should return single organization when user has one organization", async (t) => {
    const organizations = await findByUserId(6);
    t.assert.snapshot(organizations);
  });

  test("should return multiple organizations when user has multiple organizations", async (t) => {
    const organizations = await findByUserId(1);
    t.assert.snapshot(organizations);
  });
});

//

async function seed() {
  await pg.sql`
    INSERT INTO organizations
      (id, cached_libelle, cached_nom_complet, siret, created_at, updated_at)
    VALUES
      (1, '⚰️', 'Sautekh Dynasty', '40000000000001', '2023-01-15', '2024-02-10'),
      (2, '💀', 'Nihilakh Dynasty', '40000000000002', '2023-02-20', '2024-03-05'),
      (3, '🤖', 'Szarekhan Dynasty', '40000000000003', '2023-03-25', '2024-04-12'),
      (4, '🔥', 'Adeptus Mechanicus', '40000000000004', '2023-04-10', '2024-05-15'),
      (5, '👨‍🚀', 'Ultramarines Chapter', '40000000000005', '2023-05-05', '2024-06-20'),
      (6, '👹', 'Death Guard', '40000000000006', '2023-06-15', '2024-07-25')
    ;
  `;

  await pg.sql`
    INSERT INTO users
      (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
    VALUES
      (1, 'imotekh@sautekh.necron', '2023-01-20', '2024-02-15', 'Imotekh', 'The Stormlord', '00000000001', 'Phaeron'),
      (2, 'trazyn@nihilakh.necron', '2023-02-25', '2024-03-10', 'Trazyn', 'The Infinite', '00000000002', 'Archaeologist'),
      (6, 'marneus.calgar@ultramar.imperium', '2023-06-20', '2024-07-30', 'Marneus', 'Calgar', '00000000006', 'Chapter Master'),
      (7, 'mortarion@plague.chaos', '2023-07-25', '2024-08-05', 'Mortarion', 'Primarch', '00000000007', 'Daemon Primarch')
    ;
  `;

  await pg.sql`
    INSERT INTO users_organizations
      (user_id, organization_id, created_at, updated_at, is_external, verification_type, needs_official_contact_email_verification, official_contact_email_verification_token, official_contact_email_verification_sent_at, has_been_greeted)
    VALUES
      (1, 1, '2023-01-25', '2024-02-20', false, 'necron', false, 'necron_token_1', '2023-01-26', true),
      (1, 3, '2023-04-01', '2024-05-05', true, 'alliance', true, 'alliance_token_1', '2023-04-02', false),
      (2, 2, '2023-03-01', '2024-04-01', false, 'necron', false, 'necron_token_2', '2023-03-02', true),
      (6, 5, '2023-07-05', '2024-08-15', false, 'imperial', false, 'imperial_token_6', '2023-07-06', true)
    ;
  `;
}
