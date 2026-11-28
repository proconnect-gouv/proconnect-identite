import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
DELETE FROM users
WHERE last_sign_in_at IS NULL
  AND email !~ '^[^@[:space:]]+@([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$';
`);
}

export async function down(): Promise<void> {}
