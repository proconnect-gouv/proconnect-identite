import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userEmailVerified } from "./user-email-verified";

async function given({
  email_verified = false,
}: { email_verified?: boolean } = {}) {
  const pg = new PGlite();
  await migrate(pg);
  const db = drizzle(pg, { schema });
  await db.execute(sql`SET search_path TO public`);
  await db.insert(schema.users).values({
    created_at: new Date("4444-04-04"),
    email: "jean.valjean@republic.fr",
    email_verified,
    email_verified_at: email_verified ? new Date("4444-04-05") : null,
    id: 1,
    magic_link_sent_at: new Date("4444-04-04"),
    magic_link_token: "magic-token",
    updated_at: new Date("4444-04-04"),
    verify_email_sent_at: new Date("4444-04-04"),
    verify_email_token: "verify-token",
  });

  return {
    journal: () =>
      db.query.activity_logs.findMany({
        columns: { action: true, context: true, user_id: true },
        orderBy: (table, { asc }) => asc(table.id),
      }),
    runtime: createIdentiteRuntime({
      app: "proconnect-identite",
      db,
      procedures: {
        user: {
          email_verified: userEmailVerified,
        },
      },
    }).as({ type: "user", user_id: 1 }),
  };
}

describe("user.email_verified", () => {
  it("✅ verify_email clears the verify_email token pair and journals", async () => {
    const { journal, runtime } = await given();

    const { user } = await runtime.user.email_verified.mutate({
      email_verified: false,
      source: "verify_email",
      user_id: 1,
    });

    assert.equal(user.email_verified, true);
    assert.equal(user.email_verified_at instanceof Date, true);
    assert.equal(user.verify_email_token, null);
    assert.equal(user.verify_email_sent_at, null);
    assert.equal(user.magic_link_token, "magic-token");
    assert.equal(user.magic_link_sent_at instanceof Date, true);

    assert.deepEqual(await journal(), [
      {
        action: "user.email_verified",
        context: {
          inputs: { source: "verify_email" },
          outcome: { previous: { email_verified: false } },
        },
        user_id: 1,
      },
    ]);
  });

  it("✅ magic_link clears the magic_link token pair and journals", async () => {
    const { journal, runtime } = await given();

    const { user } = await runtime.user.email_verified.mutate({
      email_verified: false,
      source: "magic_link",
      user_id: 1,
    });

    assert.equal(user.email_verified, true);
    assert.equal(user.email_verified_at instanceof Date, true);
    assert.equal(user.magic_link_token, null);
    assert.equal(user.magic_link_sent_at, null);
    assert.equal(user.verify_email_token, "verify-token");
    assert.equal(user.verify_email_sent_at instanceof Date, true);

    assert.deepEqual(await journal(), [
      {
        action: "user.email_verified",
        context: {
          inputs: { source: "magic_link" },
          outcome: { previous: { email_verified: false } },
        },
        user_id: 1,
      },
    ]);
  });

  it("✅ renewal re-stamps email_verified_at and journals the previous state", async () => {
    const { journal, runtime } = await given({ email_verified: true });

    const { user } = await runtime.user.email_verified.mutate({
      email_verified: true,
      source: "verify_email",
      user_id: 1,
    });

    assert.equal(user.verify_email_token, null);
    assert.equal(user.verify_email_sent_at, null);
    assert.notEqual(
      user.email_verified_at?.getTime(),
      new Date("4444-04-05").getTime(),
    );

    assert.deepEqual(await journal(), [
      {
        action: "user.email_verified",
        context: {
          inputs: { source: "verify_email" },
          outcome: { previous: { email_verified: true } },
        },
        user_id: 1,
      },
    ]);
  });
});
