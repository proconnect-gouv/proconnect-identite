import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users
ADD COLUMN phone_number character varying,
ADD COLUMN job character varying;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users
DROP COLUMN phone_number,
DROP COLUMN job;
`);
}
