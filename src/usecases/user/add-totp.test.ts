//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { db, emptyDatabase, migrate } from "#testing";
import { with_dates } from "../../repositories/dates";
import { addTotp } from "./add-totp";

//

async function seed_user() {
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    id: 1,
    updated_at: "4444-04-04",
  });
}

async function read_user() {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, 1),
  });
  assert.ok(user);
  return with_dates(user);
}

function read_activity_logs() {
  return db.query.activity_logs.findMany({
    columns: { created_at: false, id: false },
    orderBy: (table, { asc }) => asc(table.id),
  });
}

describe("addTotp", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("stores the encrypted key and journals the previous totp state", async () => {
    await seed_user();
    const previous = await read_user();

    const user = await addTotp({
      db,
      encrypted_totp_key: "encrypted-totp-key",
      user_id: 1,
    });

    const expected = {
      ...previous,
      encrypted_totp_key: "encrypted-totp-key",
      totp_key_verified_at: null,
      updated_at: null,
    };
    assert.deepEqual(
      { ...user, totp_key_verified_at: null, updated_at: null },
      expected,
    );
    assert.ok(user.totp_key_verified_at instanceof Date);
    assert.ok(user.updated_at instanceof Date);
    assert.notEqual(user.updated_at.getTime(), previous.updated_at.getTime());

    const current = await read_user();
    assert.deepEqual(
      { ...current, totp_key_verified_at: null, updated_at: null },
      expected,
    );

    assert.deepEqual(await read_activity_logs(), [
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
});
