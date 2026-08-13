//

import { PGlite } from "@electric-sql/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { migrate } from "./migrator/migrate.js";

//

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
});
