import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users
    ALTER COLUMN encrypted_password DROP DEFAULT,
    ALTER COLUMN encrypted_password DROP NOT NULL;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users
    ALTER COLUMN encrypted_password SET DEFAULT ''::character varying,
    ALTER COLUMN encrypted_password SET NOT NULL;
  `);
}
