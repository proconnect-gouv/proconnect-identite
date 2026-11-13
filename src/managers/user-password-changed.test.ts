import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userPasswordChanged } from "./user-password-changed";

async function given() {
  const pg = new PGlite();
  await migrate(pg);
  const db = drizzle(pg, { schema });
  await db.execute(sql`SET search_path TO public`);
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    id: 1,
    reset_password_token: "token",
    updated_at: "4444-04-04",
  });

  return {
    journal: () =>
      db.query.activity_logs.findMany({
        columns: { created_at: false, id: false },
        orderBy: (table, { asc }) => asc(table.id),
      }),
    runtime: createIdentiteRuntime({
      app: "proconnect-identite",
      db,
      procedures: { user: { password_changed: userPasswordChanged } },
    }).as({ type: "user", user_id: 1 }),
    users: () => db.query.users.findMany(),
  };
}

describe("user.password_changed", () => {
  it("✅ resets the password, verifies the email and clears the token", async () => {
    const { journal, runtime, users } = await given();

    const outcome = await runtime.user.password_changed.mutate({
      encrypted_password: "hashed",
      source: "reset_password",
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      activity_id: 1,
      kind: "password_changed",
      previous: { email_verified: false },
    });

    const [user] = await users();
    assert.equal(user.encrypted_password, "hashed");
    assert.equal(user.email_verified, true);
    assert.equal(user.reset_password_token, null);

    assert.deepEqual(await journal(), [
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
    const { runtime, users } = await given();

    const outcome = await runtime.user.password_changed.mutate({
      encrypted_password: "hashed",
      source: "signup",
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      activity_id: 1,
      kind: "password_changed",
      previous: { email_verified: false },
    });

    const [user] = await users();
    assert.equal(user.email_verified, false);
    assert.equal(user.email_verified_at, null);
  });
});
