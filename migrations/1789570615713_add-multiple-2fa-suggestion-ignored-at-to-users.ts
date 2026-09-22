import { type ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users
      ADD COLUMN multiple_2fa_suggestion_ignored_at timestamp with time zone;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users
      DROP COLUMN multiple_2fa_suggestion_ignored_at;
  `);
}
