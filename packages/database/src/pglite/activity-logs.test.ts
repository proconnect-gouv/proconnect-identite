//

import { PGlite } from "@electric-sql/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { migrate } from "./migrator/migrate.js";

//

type ActivityLogRow = {
  id: number;
  action: string;
  actor_user_id: number | null;
  actor_email: string | null;
  actor_type: string;
  target_type: string | null;
  target_id: number | null;
  context: unknown;
  transaction_id: string;
  created_at: Date;
};

describe("activity_logs", () => {
  it("defaults transaction_id to the current transaction", async () => {
    const pg = new PGlite();
    await migrate(pg);

    const { rows } = await pg.query<{ transaction_id: string }>(`
      INSERT INTO public.activity_logs (action, context)
      VALUES ('franceconnect_data_sync', '{}')
      RETURNING transaction_id;
    `);

    assert.notEqual(rows[0]!.transaction_id, null);
  });

  it("shares one transaction_id across every row written in the same transaction", async () => {
    const pg = new PGlite();
    await migrate(pg);

    await pg.transaction(async (tx) => {
      await tx.query(`
        INSERT INTO public.activity_logs (action, context)
        VALUES ('franceconnect_data_sync', '{}');
      `);
      await tx.query(`
        INSERT INTO public.activity_logs (action, context)
        VALUES ('personal_info_edited', '{"before":{},"after":{}}');
      `);
    });

    const { rows } = await pg.query(`
      SELECT DISTINCT transaction_id FROM public.activity_logs;
    `);

    assert.equal(
      rows.length,
      1,
      "both rows from one transaction share one transaction_id",
    );
  });

  it("round-trips a fully populated row", async (t) => {
    const pg = new PGlite();
    await migrate(pg);
    t.mock.timers.enable({ apis: ["Date"], now: new Date("4444-04-04") });

    const { rows: inserted } = await pg.query<{ transaction_id: string }>(`
      INSERT INTO public.activity_logs
        (action, actor_email, actor_type, target_type, target_id, context)
      VALUES
        ('moderation_reopened', 'moderator@example.gouv.fr', 'admin',
         'moderation', 42, '{"reason": "checked"}'::jsonb)
      RETURNING transaction_id;
    `);

    const { rows } = await pg.query<ActivityLogRow>(`
      SELECT * FROM public.activity_logs;
    `);
    assert.deepEqual(rows, [
      {
        id: 1,
        action: "moderation_reopened",
        actor_user_id: null,
        actor_email: "moderator@example.gouv.fr",
        actor_type: "admin",
        target_type: "moderation",
        target_id: 42,
        context: { reason: "checked" },
        transaction_id: inserted[0]!.transaction_id,
        created_at: new Date("4444-04-04"),
      },
    ]);
  });

  it("defaults actor_type to 'system' and null actor/target when omitted", async (t) => {
    const pg = new PGlite();
    await migrate(pg);
    t.mock.timers.enable({ apis: ["Date"], now: new Date("4444-04-04") });

    await pg.query(`
      INSERT INTO public.activity_logs (action, context)
      VALUES ('user_self_deleted', '{}');
    `);

    const { rows } = await pg.query<ActivityLogRow>(`
      SELECT * FROM public.activity_logs;
    `);

    assert.deepEqual(rows, [
      {
        id: 1,
        action: "user_self_deleted",
        actor_user_id: null,
        actor_email: null,
        actor_type: "system",
        target_type: null,
        target_id: null,
        context: {},
        transaction_id: rows[0]!.transaction_id,
        created_at: new Date("4444-04-04"),
      },
    ]);
  });

  it("retrieves rows by (target_type, target_id)", async () => {
    const pg = new PGlite();
    await migrate(pg);

    await pg.query(`
      INSERT INTO public.activity_logs (action, target_type, target_id, context)
      VALUES
        ('moderation_cancelled', 'moderation', 1, '{"moderation_snapshot":{}}'),
        ('moderation_cancelled', 'moderation', 2, '{"moderation_snapshot":{}}');
    `);

    const { rows } = await pg.query<ActivityLogRow>(
      `
      SELECT * FROM public.activity_logs
      WHERE target_type = $1 AND target_id = $2;
    `,
      ["moderation", 2],
    );

    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.target_id, 2);
  });

  it("round-trips the typed context of every action", async () => {
    const pg = new PGlite();
    await migrate(pg);

    const cases = [
      { action: "franceconnect_data_sync", context: {} },
      {
        action: "personal_info_edited",
        context: {
          before: { family_name: "Doe" },
          after: { family_name: "Duteil" },
        },
      },
      { action: "user_self_deleted", context: {} },
      { action: "moderation_reopened", context: {} },
      {
        action: "moderation_cancelled",
        context: { moderation_snapshot: { status: "blocked", reason: null } },
      },
    ] as const;

    for (const { action, context } of cases) {
      await pg.query(
        `
        INSERT INTO public.activity_logs (action, context)
        VALUES ($1, $2::jsonb);
      `,
        [action, JSON.stringify(context)],
      );
    }

    const { rows } = await pg.query<ActivityLogRow>(`
      SELECT * FROM public.activity_logs
      ORDER BY id;
    `);

    assert.equal(rows.length, cases.length);
    for (const [index, { action, context }] of cases.entries()) {
      assert.equal(rows[index]!.action, action);
      assert.deepEqual(rows[index]!.context, context);
    }
  });

  it("assigns distinct transaction_id to separate transactions", async () => {
    const pg = new PGlite();
    await migrate(pg);

    await pg.query(`
      INSERT INTO public.activity_logs (action, context)
      VALUES ('franceconnect_data_sync', '{}');
    `);
    await pg.query(`
      INSERT INTO public.activity_logs (action, context)
      VALUES ('franceconnect_data_sync', '{}');
    `);

    const { rows } = await pg.query<{ transaction_id: string }>(`
      SELECT transaction_id FROM public.activity_logs;
    `);

    assert.equal(rows.length, 2);
    assert.notEqual(
      rows[0]!.transaction_id,
      rows[1]!.transaction_id,
      "separate transactions get distinct transaction_id",
    );
  });
});
