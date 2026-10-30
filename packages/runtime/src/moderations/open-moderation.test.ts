//

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

  return {
    db,
    runtime: createIdentiteRuntime({ app: "proconnect-identite", db }).as({
      type: "user",
      user_id: 1,
    }),
  };
}

describe("openModeration", () => {
  it("✅ opens a pending moderation and journals it under the user", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.openModeration({
      organization_id: 1,
      sp_name: "Lasagnes",
      ticket_id: "session_42",
      type: "organization_join_block",
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      kind: "moderation_opened",
      activity_id: 1,
      moderation: { id: 1 },
    });
    assert.deepEqual(
      await db.query.moderations.findMany({
        columns: {
          id: true,
          moderated_at: true,
          moderated_by: true,
          organization_id: true,
          sp_name: true,
          status: true,
          ticket_id: true,
          type: true,
          user_id: true,
        },
      }),
      [
        {
          id: 1,
          moderated_at: null,
          moderated_by: null,
          organization_id: 1,
          sp_name: "Lasagnes",
          status: "pending",
          ticket_id: "session_42",
          type: "organization_join_block",
          user_id: 1,
        },
      ],
    );
    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "moderation.opened",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: { sp_name: "Lasagnes", type: "organization_join_block" },
          outcome: {},
        },
        interaction_cid: null,
        moderation_id: 1,
        organization_id: 1,
        user_id: 1,
      },
    ]);
  });
});
