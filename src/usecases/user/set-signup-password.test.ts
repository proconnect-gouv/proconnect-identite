//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { db, emptyDatabase, migrate } from "#testing";
import { with_dates } from "../../repositories/dates";
import { setSignupPassword } from "./set-signup-password";

//

async function seed_user() {
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    email_verified: true,
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

describe("setSignupPassword", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("sets the password, unverifies the email and journals the previous state", async () => {
    await seed_user();
    const previous = await read_user();

    const user = await setSignupPassword({
      db,
      encrypted_password: "hashed-password",
      user_id: 1,
    });

    const { updated_at, ...actual } = user;
    const { updated_at: previous_updated_at, ...expected } = {
      ...previous,
      email_verified: false,
      encrypted_password: "hashed-password",
    };
    assert.deepEqual(actual, expected);
    assert.ok(updated_at instanceof Date);
    assert.notEqual(updated_at.getTime(), previous_updated_at.getTime());

    const current = await read_user();
    assert.deepEqual(
      { ...current, updated_at: null },
      { ...previous, email_verified: false, encrypted_password: "hashed-password", updated_at: null },
    );

    assert.deepEqual(await read_activity_logs(), [
      {
        action: "user.password_changed",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: { source: "signup" },
          outcome: {
            previous: { email_verified: true, password_configured: false },
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
