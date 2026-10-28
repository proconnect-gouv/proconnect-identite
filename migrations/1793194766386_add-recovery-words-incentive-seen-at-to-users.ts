import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users
  ADD COLUMN recovery_words_incentive_seen_at TIMESTAMP WITH TIME ZONE;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users
  DROP COLUMN recovery_words_incentive_seen_at;
`);
}
