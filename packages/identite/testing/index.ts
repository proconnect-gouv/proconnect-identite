//

import { PGlite } from "@electric-sql/pglite";
import { noop } from "lodash-es";
import { runner } from "node-pg-migrate";
import { join } from "path";

//

export const pg = new PGlite();

export function migrate() {
  return runner({
    dbClient: pg as any,
    dir: join(import.meta.dirname, "../../../migrations"),
    direction: "up",
    migrationsTable: "pg-migrate",
    log: noop,
  });
}

export async function emptyDatabase() {
  await pg.sql`delete from users_organizations;`;
  //
  await pg.sql`delete from organizations;`;
  await pg.sql`ALTER SEQUENCE organizations_id_seq RESTART WITH 1`;
  await pg.sql`delete from users;`;
  await pg.sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`;
  await pg.sql`delete from email_domains;`;
  await pg.sql`ALTER SEQUENCE email_domains_id_seq RESTART WITH 1`;
}
