//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { db, emptyDatabase, migrate } from "#testing";
import { with_dates } from "../../repositories/dates";
import { changePassword } from "./change-password";

//

async function seed_user() {
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    email_verified: false,
    encrypted_password: "old-hash",
    id: 1,
    reset_password_sent_at: "4444-04-04",
    reset_password_token: "reset-token",
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

describe("changePassword", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("changes the password, verifies the email, clears the reset token and journals the change", async () => {
    await seed_user();
    const previous = await read_user();

    const user = await changePassword({
      db,
      encrypted_password: "new-hash",
      user_id: 1,
    });

    const expected = {
      ...previous,
      email_verified: true,
      email_verified_at: null,
      encrypted_password: "new-hash",
      reset_password_sent_at: null,
      reset_password_token: null,
      updated_at: null,
    };
    assert.deepEqual(
      { ...user, email_verified_at: null, updated_at: null },
      expected,
    );
    assert.ok(user.email_verified_at instanceof Date);
    assert.ok(user.updated_at instanceof Date);
    assert.notEqual(user.updated_at.getTime(), previous.updated_at.getTime());

    const current = await read_user();
    assert.deepEqual(
      { ...current, email_verified_at: null, updated_at: null },
      expected,
    );

    assert.deepEqual(await read_activity_logs(), [
      {
        action: "user.password_changed",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: { source: "reset_password" },
          outcome: {
            previous: { email_verified: false, password_configured: true },
          },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });
});
