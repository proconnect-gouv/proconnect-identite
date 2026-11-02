//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { db, emptyDatabase, migrate } from "#testing";
import { regenerateRecoveryWords } from "./regenerate-recovery-words";

//

async function seed_user() {
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    id: 1,
    updated_at: "4444-04-04",
  });
}

function read_recovery_words() {
  return db.query.recovery_words.findMany({
    columns: { created_at: false, id: false },
    orderBy: (table, { asc }) => asc(table.id),
  });
}

function read_activity_logs() {
  return db.query.activity_logs.findMany({
    columns: { created_at: false, id: false },
    orderBy: (table, { asc }) => asc(table.id),
  });
}

describe("regenerateRecoveryWords", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("stores the hashed words and journals that none were configured", async () => {
    await seed_user();

    const outcome = await regenerateRecoveryWords({
      db,
      hashed_words: "new-hash",
      user_id: 1,
    });

    assert.equal(outcome, undefined);
    assert.deepEqual(await read_recovery_words(), [
      { hashed_words: "new-hash", user_id: 1 },
    ]);

    assert.deepEqual(await read_activity_logs(), [
      {
        action: "user.recovery_words_regenerated",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: { previous: { recovery_words_configured: false } },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("replaces the previous words in one transaction", async () => {
    await seed_user();
    await db
      .insert(schema.recovery_words)
      .values({ hashed_words: "old-hash", user_id: 1 });

    await regenerateRecoveryWords({
      db,
      hashed_words: "new-hash",
      user_id: 1,
    });

    assert.deepEqual(await read_recovery_words(), [
      { hashed_words: "new-hash", user_id: 1 },
    ]);
    assert.deepEqual(await read_activity_logs(), [
      {
        action: "user.recovery_words_regenerated",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: { previous: { recovery_words_configured: true } },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });
});
