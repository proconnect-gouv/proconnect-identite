//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { createModerationFactory } from "./create-moderation.js";

//

const createModeration = createModerationFactory({ pg: pg as any });

suite("createModerationFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should insert and return the moderation", async () => {
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

    const moderation = await createModeration({
      user_id: 1,
      organization_id: 1,
      type: "organization_join_block",
      ticket_id: null,
    });

    assert.equal(moderation.user_id, 1);
    assert.equal(moderation.organization_id, 1);
    assert.equal(moderation.status, "pending");
  });
});
