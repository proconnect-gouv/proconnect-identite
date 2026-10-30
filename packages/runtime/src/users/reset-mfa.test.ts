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
      email_verified: true,
      encrypted_password: "🔑",
      encrypted_totp_key: "🔐",
      force_2fa: true,
      id: 1,
      totp_key_verified_at: "4444-04-04",
      updated_at: "4444-04-04",
    },
    {
      created_at: "4444-04-04",
      email: "cosette@republic.fr",
      id: 2,
      updated_at: "4444-04-04",
    },
  ]);
  await db.insert(schema.authenticators).values([
    {
      counter: 0,
      credential_backed_up: true,
      credential_id: "jean-passkey",
      credential_public_key: new Uint8Array(),
      user_id: 1,
    },
  ]);

  return {
    db,
    runtime: createIdentiteRuntime({ app: "hyyypertool", db }).as({
      sub: "moderator-1",
      type: "moderator",
    }),
  };
}

describe("resetMfa", () => {
  it("✅ clears the credentials and the MFA factors and journals them under the moderator", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.resetMfa({ user_id: 1 });

    const previous = {
      authenticators: 1,
      email_verified: true,
      force_2fa: true,
      password_configured: true,
      totp_configured: true,
    };
    assert.deepEqual(outcome, { kind: "mfa_reset", activity_id: 1, previous });
    assert.deepEqual(await mfaState(db), [
      {
        authenticators: [],
        email_verified: false,
        encrypted_password: null,
        encrypted_totp_key: null,
        force_2fa: false,
        id: 2,
        totp_key_verified_at: null,
      },
      {
        authenticators: [],
        email_verified: false,
        encrypted_password: null,
        encrypted_totp_key: null,
        force_2fa: false,
        id: 1,
        totp_key_verified_at: null,
      },
    ]);
    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "user.mfa_reset",
        actor_ref: "moderator-1",
        actor_type: "moderator",
        app: "hyyypertool",
        cause_activity_id: null,
        context: { inputs: { user_id: 1 }, outcome: { previous } },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("❎ returns user_not_found and journals nothing for a missing account", async () => {
    const { db, runtime } = await setup();
    const before = await mfaState(db);

    const outcome = await runtime.resetMfa({ user_id: 999 });

    assert.deepEqual(outcome, { kind: "user_not_found", user_id: 999 });
    assert.deepEqual(await mfaState(db), before);
    assert.deepEqual(await readActivityLogs(db), []);
  });
});

function mfaState(db: IdentiteDatabase) {
  return db.query.users.findMany({
    columns: {
      email_verified: true,
      encrypted_password: true,
      encrypted_totp_key: true,
      force_2fa: true,
      id: true,
      totp_key_verified_at: true,
    },
    orderBy: (table, { desc }) => desc(table.id),
    with: { authenticators: { columns: { credential_id: true } } },
  });
}
