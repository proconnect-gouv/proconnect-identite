import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
CREATE INDEX idx_users_oidc_clients_user_id_created_at
  ON users_oidc_clients (user_id, created_at DESC);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
DROP INDEX IF EXISTS idx_users_oidc_clients_user_id_created_at;
`);
}
