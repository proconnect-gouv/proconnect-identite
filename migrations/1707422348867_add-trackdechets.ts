import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE organizations
      ADD COLUMN trackdechets_email_domains character varying[] DEFAULT '{}'::character varying[] NOT NULL;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE organizations
      DROP COLUMN trackdechets_email_domains;
  `);
}
