import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { createIdentiteRuntime } from "@proconnect-gouv/proconnect.identite.runtime";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { moderationOpened } from "./moderation-opened";

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
  await db.insert(schema.organizations).values({
    created_at: "4444-04-04",
    id: 1,
    siret: "11111111111111",
    updated_at: "4444-04-04",
  });

  return {
    journal: () =>
      db.query.activity_logs.findMany({
        columns: { created_at: false, id: false },
        orderBy: (table, { asc }) => asc(table.id),
      }),
    moderations: () =>
      db.query.moderations.findMany({
        columns: {
          id: true,
          moderated_at: true,
          moderated_by: true,
          organization_id: true,
          sp_name: true,
          status: true,
          ticket_id: true,
          type: true,
          user_id: true,
        },
      }),
    runtime: createIdentiteRuntime({
      app: "proconnect-identite",
      db,
      procedures: { moderation: { opened: moderationOpened } },
    }).as({ type: "user", user_id: 1 }),
  };
}

describe("moderation.opened", () => {
  it("✅ opens a pending moderation and journals it under the user", async () => {
    const { journal, moderations, runtime } = await given();

    const outcome = await runtime.moderation.opened.mutate({
      organization_id: 1,
      sp_name: "Lasagnes",
      ticket_id: "session_42",
      type: "organization_join_block",
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      activity_id: 1,
      kind: "moderation_opened",
      moderation: { id: 1 },
    });

    assert.deepEqual(await moderations(), [
      {
        id: 1,
        moderated_at: null,
        moderated_by: null,
        organization_id: 1,
        sp_name: "Lasagnes",
        status: "pending",
        ticket_id: "session_42",
        type: "organization_join_block",
        user_id: 1,
      },
    ]);

    assert.deepEqual(await journal(), [
      {
        action: "moderation.opened",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: { sp_name: "Lasagnes", type: "organization_join_block" },
          outcome: {},
        },
        interaction_cid: null,
        moderation_id: 1,
        organization_id: 1,
        user_id: 1,
      },
    ]);
  });
});
