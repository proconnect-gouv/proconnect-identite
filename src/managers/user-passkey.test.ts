import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userPasskeyAdded } from "./user-passkey-added";
import { userPasskeyRemoved } from "./user-passkey-removed";

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

  const authenticator = {
    credential_id: "CRED1",
    credential_public_key: new Uint8Array([0]),
    counter: 0,
    credential_device_type: "singleDevice",
    credential_backed_up: false,
    transports: ["usb"],
    display_name: "Yardrean's Blade",
    last_used_at: null,
    usage_count: 0,
    user_verified: true,
  };

  return {
    authenticator,
    authenticators: () =>
      db.query.authenticators.findMany({
        columns: { credential_id: true, user_id: true },
        orderBy: (table, { asc }) => asc(table.credential_id),
      }),
    insertAuthenticator: (id: string) =>
      db.insert(schema.authenticators).values({
        ...authenticator,
        credential_id: id,
        user_id: 1,
      }),
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
          passkey_added: userPasskeyAdded,
          passkey_removed: userPasskeyRemoved,
        },
      },
    }).as({ type: "user", user_id: 1 }),
  };
}

describe("user.passkey_added / user.passkey_removed", () => {
  it("✅ adds a passkey and journals it", async () => {
    const { authenticator, authenticators, journal, runtime } = await given();

    const added = await runtime.user.passkey_added.mutate({
      credential_id: authenticator.credential_id,
      display_name: authenticator.display_name,
      user_id: 1,
      authenticator,
    });
    assert.equal(added.kind, "passkey_added");
    assert.equal(added.activity_id, 1);

    assert.deepEqual(
      (await authenticators()).map((a) => a.credential_id),
      ["CRED1"],
    );
    assert.deepEqual(await journal(), [
      {
        action: "user.passkey_added",
        context: {
          inputs: {
            credential_id: "CRED1",
            display_name: "Yardrean's Blade",
          },
          outcome: {},
        },
        user_id: 1,
      },
    ]);
  });

  it("✅ removes one passkey and journals the count", async () => {
    const { authenticators, insertAuthenticator, journal, runtime } =
      await given();
    await insertAuthenticator("CRED1");

    const removed = await runtime.user.passkey_removed.mutate({
      credential_id: "CRED1",
      source: "self",
      user_id: 1,
    });
    assert.equal(removed.kind, "passkey_removed");
    assert.equal(removed.activity_id, 1);

    assert.deepEqual(await authenticators(), []);
    assert.deepEqual(await journal(), [
      {
        action: "user.passkey_removed",
        context: {
          inputs: { credential_id: "CRED1", source: "self" },
          outcome: { removed: 1 },
        },
        user_id: 1,
      },
    ]);
  });

  it("✅ removes all passkeys at once", async () => {
    const { authenticators, insertAuthenticator, journal, runtime } =
      await given();
    await insertAuthenticator("CRED1");
    await insertAuthenticator("CRED2");

    const removed = await runtime.user.passkey_removed.mutate({
      credential_id: null,
      source: "account_recovery",
      user_id: 1,
    });
    assert.equal(removed.kind, "passkey_removed");
    assert.equal(removed.activity_id, 1);

    assert.deepEqual(await authenticators(), []);
    assert.deepEqual(await journal(), [
      {
        action: "user.passkey_removed",
        context: {
          inputs: { credential_id: null, source: "account_recovery" },
          outcome: { removed: 2 },
        },
        user_id: 1,
      },
    ]);
  });

  it("✅ no passkey to remove journals nothing", async () => {
    const { journal, runtime } = await given();

    const removed = await runtime.user.passkey_removed.mutate({
      credential_id: "MISSING",
      source: "self",
      user_id: 1,
    });
    assert.equal(removed.kind, "passkey_not_found");

    assert.deepEqual(await journal(), []);
  });
});
