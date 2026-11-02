//

import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

async function setup(
  firstUser: Partial<typeof schema.users.$inferInsert> = {},
) {
  const db = await createTestDatabase();

  await db.insert(schema.users).values([
    {
      created_at: "4444-04-04",
      email: "jean.valjean@republic.fr",
      id: 1,
      updated_at: "4444-04-04",
      ...firstUser,
    },
    {
      created_at: "4444-04-04",
      email: "cosette@republic.fr",
      id: 2,
      updated_at: "4444-04-04",
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

describe("addTotp", () => {
  it("✅ stores the key, verifies it and journals a first TOTP", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.addTotp({
      encrypted_totp_key: "🔐",
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      kind: "totp_added",
      activity_id: 1,
      previous: { totp_configured: false },
    });

    const [user, untouchedUser] = await db.query.users.findMany({
      orderBy: (table, { asc }) => asc(table.id),
    });
    assert.equal(user.encrypted_totp_key, "🔐");
    assert.match(user.totp_key_verified_at ?? "", /^\d{4}-/);
    assert.equal(untouchedUser.encrypted_totp_key, null);

    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "user.totp_added",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: { previous: { totp_configured: false } },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("✅ reports the previous key when the user replaces an existing TOTP", async () => {
    const { db, runtime } = await setup({
      encrypted_totp_key: "🔑",
      totp_key_verified_at: "4444-04-04",
    });

    const outcome = await runtime.addTotp({
      encrypted_totp_key: "🔐",
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      kind: "totp_added",
      activity_id: 1,
      previous: { totp_configured: true },
    });

    const [user] = await db.query.users.findMany({
      orderBy: (table, { asc }) => asc(table.id),
    });
    assert.equal(user.encrypted_totp_key, "🔐");
  });
});
