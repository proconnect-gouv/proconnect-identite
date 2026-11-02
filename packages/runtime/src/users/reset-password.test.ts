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
    encrypted_password: "old",
    id: 1,
    updated_at: "4444-04-04",
  });

  return {
    db,
    runtime: createIdentiteRuntime({ app: "proconnect-identite", db }).as({
      type: "moderator",
      sub: "moderator+reset",
    }),
  };
}

describe("resetPassword", () => {
  it("✅ clears the password and journals the previous state under the moderator", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.resetPassword({ user_id: 1 });

    assert.deepEqual(outcome, {
      kind: "password_reset",
      activity_id: 1,
      previous: { password_configured: true },
    });

    const [user] = await db.query.users.findMany();
    assert.equal(user.encrypted_password, null);

    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "user.password_reset",
        actor_ref: "moderator+reset",
        actor_type: "moderator",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: { previous: { password_configured: true } },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });
});
