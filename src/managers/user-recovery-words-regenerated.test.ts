import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userRecoveryWordsRegenerated } from "./user-recovery-words-regenerated";

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
    recoveryWords: () =>
      db.query.recovery_words.findMany({
        orderBy: (table, { asc }) => asc(table.id),
      }),
    runtime: createIdentiteRuntime({
      app: "proconnect-identite",
      db,
      procedures: {
        user: {
          recovery_words_regenerated: userRecoveryWordsRegenerated,
        },
      },
    }).as({ type: "user", user_id: 1 }),
  };
}

describe("user.recovery_words_regenerated", () => {
  it("✅ first generation (previous false) then regeneration (previous true, one row left)", async () => {
    const { journal, recoveryWords, runtime } = await given();

    const first = await runtime.user.recovery_words_regenerated.mutate({
      hashed_words: "hash-1",
      recovery_words_configured: false,
      user_id: 1,
    });
    assert.equal(first.kind, "recovery_words_regenerated");
    assert.equal(first.activity_id, 1);
    assert.equal((await recoveryWords()).length, 1);

    const second = await runtime.user.recovery_words_regenerated.mutate({
      hashed_words: "hash-2",
      recovery_words_configured: true,
      user_id: 1,
    });
    assert.equal(second.kind, "recovery_words_regenerated");
    assert.equal(second.activity_id, 2);

    const rows = await recoveryWords();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].hashed_words, "hash-2");

    assert.deepEqual(await journal(), [
      {
        action: "user.recovery_words_regenerated",
        context: {
          inputs: {},
          outcome: { previous: { recovery_words_configured: false } },
        },
        user_id: 1,
      },
      {
        action: "user.recovery_words_regenerated",
        context: {
          inputs: {},
          outcome: { previous: { recovery_words_configured: true } },
        },
        user_id: 1,
      },
    ]);
  });
});
