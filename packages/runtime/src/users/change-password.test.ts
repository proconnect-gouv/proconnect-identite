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
    reset_password_token: "token",
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

describe("changePassword", () => {
  it("✅ resets the password, verifies the email and clears the token", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.changePassword({
      encrypted_password: "hashed",
      source: "reset_password",
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      kind: "password_changed",
      activity_id: 1,
      previous: { email_verified: false },
    });

    const [user] = await db.query.users.findMany();
    assert.equal(user.encrypted_password, "hashed");
    assert.equal(user.email_verified, true);
    assert.equal(user.reset_password_token, null);

    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "user.password_changed",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: { source: "reset_password" },
          outcome: {
            previous: { email_verified: false },
          },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("✅ keeps the email unverified when setting a first password at signup", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.changePassword({
      encrypted_password: "hashed",
      source: "signup",
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      kind: "password_changed",
      activity_id: 1,
      previous: { email_verified: false },
    });

    const [user] = await db.query.users.findMany();
    assert.equal(user.email_verified, false);
    assert.equal(user.email_verified_at, null);
  });
});
