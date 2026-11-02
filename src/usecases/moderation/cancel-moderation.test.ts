//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { db, emptyDatabase, migrate } from "#testing";
import { with_dates } from "../../repositories/dates";
import { cancelModerationRecord } from "./cancel-moderation";

//

async function seed_moderation() {
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    id: 1,
    updated_at: "4444-04-04",
  });
  await db.insert(schema.organizations).values({
    created_at: "4444-04-04",
    id: 1,
    siret: "11111111111111",
    updated_at: "4444-04-04",
  });
  await db.insert(schema.moderations).values({
    created_at: "4444-04-04",
    id: 1,
    organization_id: 1,
    status: "pending",
    type: "organization_join_block",
    user_id: 1,
  });
}

async function read_moderation() {
  const moderation = await db.query.moderations.findFirst({
    where: eq(schema.moderations.id, 1),
  });
  assert.ok(moderation);
  return with_dates(moderation);
}

function read_activity_logs() {
  return db.query.activity_logs.findMany({
    columns: { created_at: false, id: false },
    orderBy: (table, { asc }) => asc(table.id),
  });
}

describe("cancelModerationRecord", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("cancels the moderation and journals its previous status", async () => {
    await seed_moderation();
    const previous = await read_moderation();

    const outcome = await cancelModerationRecord({
      db,
      moderation_id: 1,
      organization_id: 1,
      status: "pending",
      user_id: 1,
    });

    assert.equal(outcome, undefined);
    const current = await read_moderation();
    assert.deepEqual(
      { ...current, moderated_at: null },
      { ...previous, moderated_at: null, status: "cancelled" },
    );
    assert.ok(current.moderated_at instanceof Date);

    assert.deepEqual(await read_activity_logs(), [
      {
        action: "moderation.cancelled",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: { moderation_id: 1 },
          outcome: { previous: { status: "pending" } },
        },
        interaction_cid: null,
        moderation_id: 1,
        organization_id: 1,
        user_id: 1,
      },
    ]);
  });
});
