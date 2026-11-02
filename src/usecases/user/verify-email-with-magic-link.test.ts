//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { db, emptyDatabase, migrate } from "#testing";
import { with_dates } from "../../repositories/dates";
import { verifyEmailWithMagicLink } from "./verify-email-with-magic-link";

//

async function seed_user({
  email_verified = false,
}: {
  email_verified?: boolean;
} = {}) {
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    email_verified,
    id: 1,
    magic_link_sent_at: "4444-04-04",
    magic_link_token: "magic-token",
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

describe("verifyEmailWithMagicLink", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("verifies the email, clears the magic link and journals the change", async () => {
    await seed_user();
    const previous = await read_user();

    const user = await verifyEmailWithMagicLink({ db, user_id: 1 });

    const expected = {
      ...previous,
      email_verified: true,
      email_verified_at: null,
      magic_link_sent_at: null,
      magic_link_token: null,
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
        action: "user.email_verified",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {},
          outcome: { previous: { email_verified: false } },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("journals nothing when the email was already verified", async () => {
    await seed_user({ email_verified: true });
    const previous = await read_user();

    const user = await verifyEmailWithMagicLink({ db, user_id: 1 });

    assert.deepEqual(
      { ...user, email_verified_at: null, updated_at: null },
      {
        ...previous,
        email_verified_at: null,
        magic_link_sent_at: null,
        magic_link_token: null,
        updated_at: null,
      },
    );
    assert.deepEqual(await read_activity_logs(), []);
  });
});
