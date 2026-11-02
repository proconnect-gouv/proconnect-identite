//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { db, emptyDatabase, migrate } from "#testing";
import { with_dates } from "../../repositories/dates";
import { removeTotp } from "./remove-totp";

//

async function seed_user({
  encrypted_totp_key = null,
}: {
  encrypted_totp_key?: string | null;
} = {}) {
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    encrypted_totp_key,
    id: 1,
    totp_key_verified_at: encrypted_totp_key ? "4444-04-04" : null,
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

describe("removeTotp", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("clears the encrypted key and journals the previous totp state", async () => {
    await seed_user({ encrypted_totp_key: "encrypted-totp-key" });
    const previous = await read_user();

    const user = await removeTotp({ db, user_id: 1 });

    const expected = {
      ...previous,
      encrypted_totp_key: null,
      totp_key_verified_at: null,
      updated_at: null,
    };
    assert.deepEqual({ ...user, updated_at: null }, expected);
    assert.ok(user.updated_at instanceof Date);
    assert.notEqual(user.updated_at.getTime(), previous.updated_at.getTime());

    const current = await read_user();
    assert.deepEqual({ ...current, updated_at: null }, expected);

    assert.deepEqual(await read_activity_logs(), [
      {
        action: "user.totp_removed",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: { previous: { totp_configured: true } },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("writes nothing when no totp is configured", async () => {
    await seed_user();
    const previous = await read_user();

    const user = await removeTotp({ db, user_id: 1 });

    assert.deepEqual(user, previous);
    assert.deepEqual(await read_user(), previous);
    assert.deepEqual(await read_activity_logs(), []);
  });
});
