import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userForce2faDisabled } from "./user-force-2fa-disabled";
import { userForce2faEnabled } from "./user-force-2fa-enabled";

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
          force_2fa_disabled: userForce2faDisabled,
          force_2fa_enabled: userForce2faEnabled,
        },
      },
    }).as({ type: "user", user_id: 1 }),
  };
}

describe("user.force_2fa_enabled / user.force_2fa_disabled", () => {
  it("✅ sets then clears force_2fa and journals each change", async () => {
    const { journal, runtime } = await given();

    const enabled = await runtime.user.force_2fa_enabled.mutate({ user_id: 1 });
    assert.equal(enabled.kind, "force_2fa_enabled");
    assert.equal(enabled.activity_id, 1);
    assert.equal(enabled.user.force_2fa, true);

    const disabled = await runtime.user.force_2fa_disabled.mutate({
      reason: "passkey_removed",
      user_id: 1,
    });
    assert.equal(disabled.kind, "force_2fa_disabled");
    assert.equal(disabled.activity_id, 2);
    assert.equal(disabled.user.force_2fa, false);

    assert.deepEqual(await journal(), [
      {
        action: "user.force_2fa_enabled",
        context: { inputs: {}, outcome: {} },
        user_id: 1,
      },
      {
        action: "user.force_2fa_disabled",
        context: {
          inputs: { reason: "passkey_removed" },
          outcome: {},
        },
        user_id: 1,
      },
    ]);
  });
});
