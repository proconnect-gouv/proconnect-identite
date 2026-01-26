import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
CREATE TABLE email_deliverability_whitelist (
    problematic_email character varying NOT NULL,
    email_domain character varying NOT NULL UNIQUE PRIMARY KEY,
    verified_at timestamp with time zone DEFAULT NOW() NOT NULL,
    verified_by character varying
);`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`DROP TABLE email_deliverability_whitelist;`);
}
