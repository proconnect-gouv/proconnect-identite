//

import type { IdentiteDatabase } from "#src/database";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";

//

export async function createTestDatabase() {
  const pg = new PGlite();
  await migrate(pg);
  const db = drizzle(pg, { schema });
  await db.execute(sql`SET search_path TO public`);
  return db;
}

export function readActivityLogs(db: IdentiteDatabase) {
  return db.query.activity_logs.findMany({
    columns: { created_at: false, id: false },
    orderBy: (table, { asc }) => asc(table.id),
  });
}
