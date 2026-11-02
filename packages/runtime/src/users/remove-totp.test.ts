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

describe("removeTotp", () => {
  it("✅ clears the key and the forced 2FA when no other factor remains", async () => {
    const { db, runtime } = await setup({
      encrypted_totp_key: "🔐",
      force_2fa: true,
      totp_key_verified_at: "4444-04-04",
    });

    const outcome = await runtime.removeTotp({ user_id: 1 });

    assert.deepEqual(outcome, {
      kind: "totp_removed",
      activity_id: 1,
      force_2fa_cleared: true,
      previous: { force_2fa: true },
    });

    const [user, untouchedUser] = await db.query.users.findMany({
      orderBy: (table, { asc }) => asc(table.id),
    });
    assert.equal(user.encrypted_totp_key, null);
    assert.equal(user.totp_key_verified_at, null);
    assert.equal(user.force_2fa, false);
    assert.equal(untouchedUser.force_2fa, false);

    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "user.totp_removed",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: {
            force_2fa_cleared: true,
            previous: { force_2fa: true },
          },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("✅ keeps the forced 2FA when a passkey remains", async () => {
    const { db, runtime } = await setup({
      encrypted_totp_key: "🔐",
      force_2fa: true,
      totp_key_verified_at: "4444-04-04",
    });
    await db.insert(schema.authenticators).values({
      counter: 0,
      credential_backed_up: true,
      credential_id: "jean-passkey",
      credential_public_key: new Uint8Array(),
      user_id: 1,
    });

    const outcome = await runtime.removeTotp({ user_id: 1 });

    assert.deepEqual(outcome, {
      kind: "totp_removed",
      activity_id: 1,
      force_2fa_cleared: false,
      previous: { force_2fa: true },
    });

    const [user] = await db.query.users.findMany({
      orderBy: (table, { asc }) => asc(table.id),
    });
    assert.equal(user.encrypted_totp_key, null);
    assert.equal(user.force_2fa, true);
  });

  it("✅ journals nothing when no TOTP is configured", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.removeTotp({ user_id: 1 });

    assert.deepEqual(outcome, { kind: "totp_unchanged", user_id: 1 });

    const [user] = await db.query.users.findMany({
      orderBy: (table, { asc }) => asc(table.id),
    });
    assert.match(user.updated_at, /^4444-04-04/);
    assert.deepEqual(await readActivityLogs(db), []);
  });
});
