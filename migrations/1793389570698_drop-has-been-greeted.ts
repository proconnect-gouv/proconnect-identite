import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_organizations
  DROP COLUMN IF EXISTS has_been_greeted;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_organizations
  ADD COLUMN has_been_greeted boolean NOT NULL DEFAULT FALSE;
`);
}
