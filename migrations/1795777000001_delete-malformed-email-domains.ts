import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
DELETE FROM email_domains
WHERE domain !~ '^([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$';
`);
}

export async function down(): Promise<void> {}
