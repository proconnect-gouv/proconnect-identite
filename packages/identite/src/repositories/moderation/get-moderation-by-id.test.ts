//

import { emptyDatabase, migrate, pg } from "#testing";
import { ModerationNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { getModerationByIdFactory } from "./get-moderation-by-id.js";

//

const getModerationById = getModerationByIdFactory({ pg: pg as any });

suite("getModerationByIdFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should throw ModerationNotFoundError when not found", async () => {
    await assert.rejects(
      () => getModerationById(1),
      (err: unknown) => err instanceof ModerationNotFoundError,
    );
  });

  test("should return the moderation when it exists", async () => {
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
      INSERT INTO moderations
        (id, user_id, organization_id, type, status, created_at)
      VALUES
        (1, 1, 1, 'organization_join_block', 'pending', '4444-04-04')
      ;
    `;

    const moderation = await getModerationById(1);

    assert.equal(moderation.id, 1);
  });
});
