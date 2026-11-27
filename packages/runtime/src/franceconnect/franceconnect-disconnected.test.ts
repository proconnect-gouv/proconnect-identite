//

import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

async function given() {
  const db = await createTestDatabase();

  await db.insert(schema.users).values([
    {
      created_at: new Date("4444-04-04"),
      email: "jean.valjean@republic.fr",
      id: 1,
      updated_at: new Date("4444-04-04"),
    },
    {
      created_at: new Date("4444-04-04"),
      email: "cosette@republic.fr",
      id: 2,
      updated_at: new Date("4444-04-04"),
    },
  ]);
  await db.insert(schema.franceconnect_userinfo).values({
    created_at: "4444-04-04",
    sub: "fc-sub-jean",
    updated_at: "4444-04-04",
    user_id: 1,
  });

  return {
    identities: () =>
      db.query.franceconnect_userinfo.findMany({
        columns: { sub: true, user_id: true },
        orderBy: (table, { asc }) => asc(table.user_id),
      }),
    journal: () => readActivityLogs(db),
    runtime: createIdentiteRuntime({ app: "proconnect-identite", db }).as({
      type: "user",
      user_id: 1,
    }),
  };
}

describe("franceconnect.disconnected", () => {
  it("✅ removes the FranceConnect identity and journals it under the user", async () => {
    const { identities, journal, runtime } = await given();

    const outcome = await runtime.franceconnect.disconnected.mutate({
      user_id: 1,
    });

    const connected_at = "4444-04-04 00:00:00+00";
    assert.deepEqual(outcome, {
      activity_id: 1,
      connected_at,
      kind: "franceconnect_disconnected",
    });
    assert.deepEqual(await identities(), []);
    assert.deepEqual(await journal(), [
      {
        action: "franceconnect.disconnected",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: { inputs: {}, outcome: { connected_at } },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("❎ returns franceconnect_identity_not_found and journals nothing for a missing identity", async () => {
    const { identities, journal, runtime } = await given();
    const before = await identities();

    const outcome = await runtime.franceconnect.disconnected.mutate({
      user_id: 2,
    });

    assert.deepEqual(outcome, {
      kind: "franceconnect_identity_not_found",
      user_id: 2,
    });
    assert.deepEqual(await identities(), before);
    assert.deepEqual(await journal(), []);
  });
});
