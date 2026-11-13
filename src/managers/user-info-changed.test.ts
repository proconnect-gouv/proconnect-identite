import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userInfoChanged } from "./user-info-changed";

async function given() {
  const pg = new PGlite();
  await migrate(pg);
  const db = drizzle(pg, { schema });
  await db.execute(sql`SET search_path TO public`);
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    id: 1,
    updated_at: "4444-04-04",
  });

  return {
    journal: () =>
      db.query.activity_logs.findMany({
        columns: { created_at: false, id: false },
        orderBy: (table, { asc }) => asc(table.id),
      }),
    runtime: createIdentiteRuntime({
      app: "proconnect-identite",
      db,
      procedures: { user: { info_changed: userInfoChanged } },
    }).as({ type: "user", user_id: 1 }),
  };
}

describe("user.info_changed", () => {
  it("✅ changes the profile and journals the previous values", async () => {
    const { journal, runtime } = await given();

    const outcome = await runtime.user.info_changed.mutate({
      family_name: "Valjean",
      given_name: "Jean",
      job: "Maire",
      phone_number: null,
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      activity_id: 1,
      kind: "info_changed",
      next: {
        family_name: "Valjean",
        given_name: "Jean",
        job: "Maire",
        phone_number: null,
      },
      previous: {
        family_name: null,
        given_name: null,
        job: null,
        phone_number: null,
      },
    });
    assert.deepEqual(await journal(), [
      {
        action: "user.info_changed",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {
            family_name: "Valjean",
            given_name: "Jean",
            job: "Maire",
            phone_number: null,
          },
          outcome: {
            previous: {
              family_name: null,
              given_name: null,
              job: null,
              phone_number: null,
            },
          },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("❎ writes nothing when the profile does not change", async () => {
    const { journal, runtime } = await given();

    const outcome = await runtime.user.info_changed.mutate({
      given_name: null,
      user_id: 1,
    });

    assert.deepEqual(outcome, { kind: "info_unchanged", user_id: 1 });
    assert.deepEqual(await journal(), []);
  });

  it("❎ returns user_not_found and journals nothing", async () => {
    const { journal, runtime } = await given();

    const outcome = await runtime.user.info_changed.mutate({
      given_name: "Jean",
      user_id: 42,
    });

    assert.deepEqual(outcome, { kind: "user_not_found", user_id: 42 });
    assert.deepEqual(await journal(), []);
  });
});
