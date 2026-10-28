import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_oidc_clients
  ADD COLUMN last_halt VARCHAR;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_oidc_clients
  DROP COLUMN last_halt;
`);
}
