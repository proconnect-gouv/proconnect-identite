//

import { PGlite } from "@electric-sql/pglite";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { migrate as migratePglite } from "@proconnect-gouv/proconnect.identite.database/pglite/migrator";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";

//

export const client = new PGlite();
export const db = drizzle(client, { schema });

export async function migrate() {
  await migratePglite(client);
  await db.execute(sql`SET search_path TO public`);
}
