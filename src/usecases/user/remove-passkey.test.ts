//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { db, emptyDatabase, migrate } from "#testing";
import { removePasskey } from "./remove-passkey";

//

async function seed_user() {
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    id: 1,
    updated_at: "4444-04-04",
  });
}

async function seed_authenticator() {
  await db.insert(schema.authenticators).values({
    counter: 0,
    credential_backed_up: false,
    credential_id: "credential-id",
    credential_public_key: new Uint8Array([1, 2, 3]),
    display_name: "Ma clé",
    user_id: 1,
    user_verified: true,
  });
}

function read_activity_logs() {
  return db.query.activity_logs.findMany({
    columns: { created_at: false, id: false },
    orderBy: (table, { asc }) => asc(table.id),
  });
}

describe("removePasskey", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("deletes the authenticator and journals its credential id", async () => {
    await seed_user();
    await seed_authenticator();

    const outcome = await removePasskey({
      credential_id: "credential-id",
      db,
      user_id: 1,
    });

    assert.equal(outcome, true);
    assert.deepEqual(
      await db.query.authenticators.findMany({
        columns: { credential_id: true },
      }),
      [],
    );

    assert.deepEqual(await read_activity_logs(), [
      {
        action: "user.passkey_removed",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: { inputs: { credential_id: "credential-id" }, outcome: {} },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("writes nothing when the authenticator does not belong to the user", async () => {
    await seed_user();
    await seed_authenticator();

    const outcome = await removePasskey({
      credential_id: "unknown-credential-id",
      db,
      user_id: 1,
    });

    assert.equal(outcome, false);
    assert.deepEqual(
      await db.query.authenticators.findMany({
        columns: { credential_id: true },
      }),
      [{ credential_id: "credential-id" }],
    );
    assert.deepEqual(await read_activity_logs(), []);
  });
});
