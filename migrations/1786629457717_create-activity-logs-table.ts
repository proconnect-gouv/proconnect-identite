import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
CREATE TABLE activity_logs (
    id serial PRIMARY KEY,
    action character varying NOT NULL,
    actor_user_id integer REFERENCES users(id) ON DELETE SET NULL,
    actor_email character varying,
    actor_type character varying NOT NULL DEFAULT 'system',
    target_type character varying,
    target_id integer,
    context jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT NOW()
);
`);
  await pgm.db.query(`
CREATE INDEX idx_activity_logs_actor_email_created_at
  ON activity_logs (actor_email, created_at);
`);
  await pgm.db.query(`
CREATE INDEX idx_activity_logs_target
  ON activity_logs (target_type, target_id);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`DROP TABLE activity_logs;`);
}
