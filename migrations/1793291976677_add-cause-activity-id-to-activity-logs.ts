import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE activity_logs
  ADD COLUMN cause_activity_id INTEGER;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE activity_logs
  DROP COLUMN IF EXISTS cause_activity_id;
`);
}
