//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { findPendingModerationFactory } from "./find-pending-moderation.js";

//

const findPendingModeration = findPendingModerationFactory({ pg: pg as any });

suite("findPendingModerationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return undefined when no pending moderation exists", async () => {
    const moderation = await findPendingModeration({
      user_id: 1,
      organization_id: 1,
      type: "organization_join_block",
    });

    assert.equal(moderation, undefined);
  });

  test("should return the pending moderation", async () => {
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

    const moderation = await findPendingModeration({
      user_id: 1,
      organization_id: 1,
      type: "organization_join_block",
    });

    assert.equal(moderation?.id, 1);
  });
});
