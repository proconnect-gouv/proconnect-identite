//

import { PGlite } from "@electric-sql/pglite";
import { pgDump } from "@electric-sql/pglite-tools/pg_dump";

import { runner } from "node-pg-migrate";
import { writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = relative(__dirname, join(__dirname, "..", ".."));
export const pg = new PGlite();

// Run migrations
await runner({
  dbClient: pg as any,
  dir: join(root, "./migrations"),
  direction: "up",
  migrationsTable: "pg-migrate",
  log: console.debug,
});

// Drop migration table before export
await pg.exec('DROP TABLE IF EXISTS "pg-migrate"');

// Export schema using pg_dump with schema-only args
const dump = await pgDump({
  pg,
  args: ["--schema-only", "--no-owner", "--no-privileges"],
});
const schema = await dump.text();

const schemaPath = join(__dirname, "..", "schema.sql");
writeFileSync(schemaPath, schema);

console.log(`Schema exported to ${schemaPath}`);
