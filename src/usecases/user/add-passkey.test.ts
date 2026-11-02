//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { db, emptyDatabase, migrate } from "#testing";
import { addPasskey } from "./add-passkey";

//

async function seed_user() {
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    id: 1,
    updated_at: "4444-04-04",
  });
}

function read_activity_logs() {
  return db.query.activity_logs.findMany({
    columns: { created_at: false, id: false },
    orderBy: (table, { asc }) => asc(table.id),
  });
}

describe("addPasskey", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("stores the authenticator and journals its display name and credential id", async () => {
    await seed_user();

    const outcome = await addPasskey({
      authenticator: {
        counter: 0,
        credential_backed_up: false,
        credential_device_type: "singleDevice",
        credential_id: "credential-id",
        credential_public_key: new Uint8Array([1, 2, 3]),
        display_name: "Ma clé",
        last_used_at: null,
        transports: ["usb"],
        usage_count: 0,
        user_verified: true,
      },
      db,
      user_id: 1,
    });

    assert.equal(outcome, undefined);

    assert.deepEqual(
      await db.query.authenticators.findFirst({
        columns: { created_at: false },
      }),
      {
        counter: 0,
        credential_backed_up: false,
        credential_device_type: "singleDevice",
        credential_id: "credential-id",
        credential_public_key: new Uint8Array([1, 2, 3]),
        display_name: "Ma clé",
        last_used_at: null,
        transports: ["usb"],
        usage_count: 0,
        user_id: 1,
        user_verified: true,
      },
    );

    assert.deepEqual(await read_activity_logs(), [
      {
        action: "user.passkey_added",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: { display_name: "Ma clé" },
          outcome: { credential_id: "credential-id" },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });
});
