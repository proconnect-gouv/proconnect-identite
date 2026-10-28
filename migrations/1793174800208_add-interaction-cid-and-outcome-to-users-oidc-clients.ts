import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_oidc_clients
  ADD COLUMN interaction_cid VARCHAR,
  ADD COLUMN outcome VARCHAR;
`);
  await pgm.db.query(`
CREATE UNIQUE INDEX idx_users_oidc_clients_interaction_cid
  ON users_oidc_clients (interaction_cid)
  WHERE interaction_cid IS NOT NULL;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
DROP INDEX IF EXISTS idx_users_oidc_clients_interaction_cid;
`);
  await pgm.db.query(`
ALTER TABLE users_oidc_clients
  DROP COLUMN interaction_cid,
  DROP COLUMN outcome;
`);
}
