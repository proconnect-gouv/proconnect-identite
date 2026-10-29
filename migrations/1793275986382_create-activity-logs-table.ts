import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR NOT NULL,
  actor_ref VARCHAR NOT NULL,
  actor_type VARCHAR NOT NULL,
  app VARCHAR NOT NULL,
  context JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  interaction_cid VARCHAR,
  moderation_id INTEGER,
  organization_id INTEGER,
  user_id INTEGER
);
`);
  // hyyypertool: a user's link changes, newest first
  await pgm.db.query(`
CREATE INDEX idx_activity_logs_user_id_created_at
  ON activity_logs (user_id, created_at);
`);
  // hyyypertool: an organization's domain history, newest first
  await pgm.db.query(`
CREATE INDEX idx_activity_logs_organization_id_created_at
  ON activity_logs (organization_id, created_at);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
DROP TABLE IF EXISTS activity_logs;
`);
}
