//

import { describe, it } from "node:test";
import PG from "pg";
import { migrate } from "./migrate.js";

//

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
      await migrate(pg.client);

      await pg.client.query(`
        DROP TABLE IF EXISTS public.pgmigrations;
      `);

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
