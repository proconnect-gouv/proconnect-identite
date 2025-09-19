//

import { PGlite } from "@electric-sql/pglite";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import PG from "pg";
import { migrate } from "./migrate.js";

//

describe("migrate", () => {
  it("should handle empty database migration", async (t) => {
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
    await migrate(pg as any);

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

describe("external", { skip: !process.env["DATABASE_URL"] }, () => {
  it("should handle empty database migration", async (t) => {
    await using pg = {
      client: new PG.Client(process.env["DATABASE_URL"]),
      async [Symbol.asyncDispose]() {
        await this.client.end();
      },
    };

    await pg.client.connect();

    // Verify no tables exist initially
    {
      const result = await pg.client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
      assert.equal(result.rows.length, 0, "Should start with empty database");
    }
    // Clean up any existing tables
    await pg.client.query("DROP SCHEMA IF EXISTS public CASCADE");
    await pg.client.query("CREATE SCHEMA public");

    // Run migration
    await migrate(pg.client);

    // Verify migration completed successfully
    const result = await pg.client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    t.assert.snapshot(result.rows);
  });
});
