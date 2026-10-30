//

import type { IdentiteDatabase } from "#src/database";
import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

async function setup() {
  const db = await createTestDatabase();

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
  await db.insert(schema.moderations).values([
    {
      id: 1,
      organization_id: 1,
      status: "pending",
      type: "organization_join_block",
      user_id: 1,
    },
    {
      id: 2,
      moderated_at: "4444-04-04",
      organization_id: 1,
      status: "accepted",
      type: "organization_join_block",
      user_id: 1,
    },
  ]);

  return {
    db,
    runtime: createIdentiteRuntime({ app: "proconnect-identite", db }).as({
      type: "user",
      user_id: 1,
    }),
  };
}

describe("cancelModeration", () => {
  it("✅ cancels the pending moderation, keeps its row and journals it under the user", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.cancelModeration({ moderation_id: 1 });

    assert.deepEqual(outcome, {
      kind: "moderation_cancelled",
      activity_id: 1,
      previous: { status: "pending" },
    });
    assert.deepEqual(
      (await moderationsState(db)).map(({ moderated_at, ...rest }) => ({
        ...rest,
        moderated: moderated_at !== null,
      })),
      [
        { id: 1, moderated: true, status: "cancelled" },
        { id: 2, moderated: true, status: "accepted" },
      ],
    );
    assert.deepEqual(await readActivityLogs(db), [
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

  it("❎ returns moderation_not_pending and journals nothing for a resolved moderation", async () => {
    const { db, runtime } = await setup();
    const before = await moderationsState(db);

    const outcome = await runtime.cancelModeration({ moderation_id: 2 });

    assert.deepEqual(outcome, {
      kind: "moderation_not_pending",
      moderation_id: 2,
    });
    assert.deepEqual(await moderationsState(db), before);
    assert.deepEqual(await readActivityLogs(db), []);
  });

  it("❎ returns moderation_not_found and journals nothing for a missing moderation", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.cancelModeration({ moderation_id: 999 });

    assert.deepEqual(outcome, {
      kind: "moderation_not_found",
      moderation_id: 999,
    });
    assert.deepEqual(await readActivityLogs(db), []);
  });
});

function moderationsState(db: IdentiteDatabase) {
  return db.query.moderations.findMany({
    columns: { id: true, moderated_at: true, status: true },
    orderBy: (table, { asc }) => asc(table.id),
  });
}
