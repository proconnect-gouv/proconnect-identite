//

import { PGlite } from "@electric-sql/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import PG from "pg";
import { migrate } from "./migrate.js";

//

describe("Database migration with in-memory PostgreSQL", () => {
  it("bootstraps schema from scratch on clean database", async (t) => {
    const pg = new PGlite();

    // Verify no tables exist initially
    {
      const result = await pg.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      assert.equal(result.rows.length, 0, "Should start with empty database");
    }

    // Run migration
    await migrate(pg.exec.bind(pg));

    // Verify migration completed successfully
    {
      const result = await pg.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);

      t.assert.snapshot(result.rows);
    }
  });
});

describe(
  "Database migration with external PostgreSQL",
  { skip: !process.env["DATABASE_URL"] },
  () => {
    it("applies complete schema to fresh database instance", async (t) => {
      await using pg = {
        client: new PG.Client(process.env["DATABASE_URL"]),
        async [Symbol.asyncDispose]() {
          await this.client.end();
        },
      };

      await pg.client.connect();

      // Run migration
      await migrate(pg.client.query.bind(pg.client));

      // Verify migration completed successfully
      const result = await pg.client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

      t.assert.snapshot(result.rows);
    });
  },
);
