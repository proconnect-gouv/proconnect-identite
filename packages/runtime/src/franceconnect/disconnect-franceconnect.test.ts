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

  await db.insert(schema.users).values([
    {
      created_at: "4444-04-04",
      email: "jean.valjean@republic.fr",
      id: 1,
      updated_at: "4444-04-04",
    },
    {
      created_at: "4444-04-04",
      email: "cosette@republic.fr",
      id: 2,
      updated_at: "4444-04-04",
    },
  ]);
  await db.insert(schema.franceconnect_userinfo).values({
    created_at: "4444-04-04",
    sub: "fc-sub-jean",
    updated_at: "4444-04-04",
    user_id: 1,
  });

  return {
    db,
    runtime: createIdentiteRuntime({ app: "proconnect-identite", db }).as({
      type: "user",
      user_id: 1,
    }),
  };
}

describe("disconnectFranceConnect", () => {
  it("✅ removes the FranceConnect identity and journals it under the user", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.disconnectFranceConnect({ user_id: 1 });

    assert.equal(outcome.kind, "franceconnect_disconnected");
    if (outcome.kind !== "franceconnect_disconnected") return;
    assert.match(outcome.connected_at, /^4444-04-04/);
    assert.deepEqual(await identities(db), []);
    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "franceconnect.disconnected",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: { connected_at: outcome.connected_at },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("❎ returns franceconnect_identity_not_found and journals nothing for a missing identity", async () => {
    const { db, runtime } = await setup();
    const before = await identities(db);

    const outcome = await runtime.disconnectFranceConnect({ user_id: 2 });

    assert.deepEqual(outcome, {
      kind: "franceconnect_identity_not_found",
      user_id: 2,
    });
    assert.deepEqual(await identities(db), before);
    assert.deepEqual(await readActivityLogs(db), []);
  });
});

function identities(db: IdentiteDatabase) {
  return db.query.franceconnect_userinfo.findMany({
    columns: { sub: true, user_id: true },
    orderBy: (table, { asc }) => asc(table.user_id),
  });
}
