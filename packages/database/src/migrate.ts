//

import type { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Client } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function migrate(pg_client: Client | PGlite) {
  const schemaPath = join(__dirname, "..", "schema.sql");
  const schema = await readFile(schemaPath, "utf-8");

  // Use exec for multiple statements (PGlite)
  if ("exec" in pg_client && typeof pg_client.exec === "function") {
    await (pg_client as PGlite).exec(schema);
  } else {
    await (pg_client as Client).query(schema);
  }
}
