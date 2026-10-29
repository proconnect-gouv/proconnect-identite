//

import type { ContextsOf } from "#src/activity";
import type { IdentiteTransaction } from "#src/database";
import { createIdentiteRuntime } from "#src/runtime";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { TransactionRollbackError } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import assert from "node:assert/strict";
import { before, describe, it, mock } from "node:test";
import * as z from "zod";

//

const hyyypertool_activities = {
  "domain.refused": z.object({
    inputs: z.object({
      domain: z.string(),
      verification_type: z.literal("refused"),
    }),
    outcome: z.object({
      email_domain_id: z.number(),
      replaced_verification_types: z.array(z.string()),
    }),
  }),
};

type HyyypertoolActivityContexts = ContextsOf<typeof hyyypertool_activities>;

const darkangels_refused = {
  action: "domain.refused" as const,
  context: {
    inputs: {
      domain: "darkangels.world",
      verification_type: "refused" as const,
    },
    outcome: {
      email_domain_id: 7,
      replaced_verification_types: ["not_verified_yet"],
    },
  },
  organization_id: 1,
};

async function setup() {
  const pg = new PGlite();
  await migrate(pg);
  await pg.exec("SET search_path TO public;");
  const db = drizzle(pg, { schema });

  return {
    db,
    moderator: createIdentiteRuntime<HyyypertoolActivityContexts>({
      app: "hyyypertool",
      db,
    }).as({ type: "moderator", sub: "moderator+refuses-darkangels.world" }),
    pg,
  };
}

describe("record", () => {
  before(() => {
    mock.timers.enable({ apis: ["Date"], now: new Date("5555-05-05") });
  });

  it("✅ journals the caller's own action under its actor, in the caller's transaction", async () => {
    const { db, moderator, pg } = await setup();

    const outcome = await db.transaction((tx) =>
      moderator.record(tx, darkangels_refused),
    );

    assert.deepEqual(outcome, { activity_id: 1 });
    assert.deepEqual(
      (await pg.query("SELECT * FROM activity_logs ORDER BY id")).rows,
      [
        {
          action: "domain.refused",
          actor_ref: "moderator+refuses-darkangels.world",
          actor_type: "moderator",
          app: "hyyypertool",
          cause_activity_id: null,
          context: darkangels_refused.context,
          created_at: new Date("5555-05-05"),
          id: 1,
          interaction_cid: null,
          moderation_id: null,
          organization_id: 1,
          user_id: null,
        },
      ],
    );
  });

  it("❎ leaves no row when the caller's transaction rolls back", async () => {
    const { db, moderator, pg } = await setup();

    await assert.rejects(
      db.transaction(async (tx) => {
        await moderator.record(tx, darkangels_refused);
        tx.rollback();
      }),
      TransactionRollbackError,
    );

    assert.deepEqual((await pg.query("SELECT * FROM activity_logs")).rows, []);
  });

  it("🚫 does not compile another owner's action, a mismatched context, the bare database or an overlapping owner", () => {
    const db = drizzle(new PGlite(), { schema });
    const { record } = createIdentiteRuntime<HyyypertoolActivityContexts>({
      app: "hyyypertool",
      db,
    }).as({ type: "moderator", sub: "moderator" });

    void ((tx: IdentiteTransaction) =>
      record(tx, {
        // @ts-expect-error domain.verified belongs to the runtime, only markDomainAsVerified writes it
        action: "domain.verified",
        context: darkangels_refused.context,
      }));

    void ((tx: IdentiteTransaction) =>
      record(tx, {
        action: "domain.refused",
        // @ts-expect-error the context does not match domain.refused
        context: { inputs: { domain: "darkangels.world" }, outcome: {} },
      }));

    void (() =>
      // @ts-expect-error the bare database is not a transaction
      record(db, darkangels_refused));

    type OverlappingContexts = {
      "domain.verified": HyyypertoolActivityContexts["domain.refused"];
    };
    // @ts-expect-error domain.verified is already defined by the runtime
    void createIdentiteRuntime<OverlappingContexts>({ app: "hyyypertool", db });

    void ((tx: IdentiteTransaction) =>
      createIdentiteRuntime({ app: "proconnect-identite", db })
        .as({ type: "app", job: "join.official_contact" })
        // @ts-expect-error proconnect-identite has no app-only action to record
        .record(tx, darkangels_refused));
  });
});
