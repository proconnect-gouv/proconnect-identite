//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { reopenModerationFactory } from "./reopen-moderation.js";

//

const reopenModeration = reopenModerationFactory({ pg: pg as any });

suite("reopenModerationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should clear moderated_at and set status to reopened", async () => {
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
        (id, user_id, organization_id, type, status, moderated_at, created_at, comment)
      VALUES
        (1, 1, 1, 'organization_join_block', 'rejected', '4444-04-04', '4444-04-04', 'old comment')
      ;
    `;

    const moderation = await reopenModeration({
      id: 1,
      userEmail: "lion@darkangels",
      cause: "test",
    });

    assert.equal(moderation?.status, "reopened");
    assert.equal(moderation?.moderated_at, null);
  });
});
