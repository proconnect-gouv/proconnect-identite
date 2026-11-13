import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userTotpAdded } from "./user-totp-added";
import { userTotpRemoved } from "./user-totp-removed";

async function given() {
  const pg = new PGlite();
  await migrate(pg);
  const db = drizzle(pg, { schema });
  await db.execute(sql`SET search_path TO public`);
  await db.insert(schema.users).values({
    created_at: new Date("4444-04-04"),
    email: "jean.valjean@republic.fr",
    id: 1,
    updated_at: new Date("4444-04-04"),
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
          totp_added: userTotpAdded,
          totp_removed: userTotpRemoved,
        },
      },
    }).as({ type: "user", user_id: 1 }),
  };
}

describe("user.totp_added / user.totp_removed", () => {
  it("✅ adds then removes a TOTP key and journals each change", async () => {
    const { journal, runtime } = await given();

    const added = await runtime.user.totp_added.mutate({
      encrypted_totp_key: "encrypted-key",
      totp_configured: false,
      user_id: 1,
    });
    assert.equal(added.kind, "totp_added");
    assert.equal(added.activity_id, 1);
    assert.equal(added.user.encrypted_totp_key, "encrypted-key");
    assert.notEqual(added.user.totp_key_verified_at, null);

    const removed = await runtime.user.totp_removed.mutate({
      source: "self",
      user_id: 1,
    });
    assert.equal(removed.kind, "totp_removed");
    assert.equal(removed.activity_id, 2);
    assert.equal(removed.user.encrypted_totp_key, null);
    assert.equal(removed.user.totp_key_verified_at, null);

    assert.deepEqual(await journal(), [
      {
        action: "user.totp_added",
        context: {
          inputs: {},
          outcome: { previous: { totp_configured: false } },
        },
        user_id: 1,
      },
      {
        action: "user.totp_removed",
        context: { inputs: { source: "self" }, outcome: {} },
        user_id: 1,
      },
    ]);
  });
});
