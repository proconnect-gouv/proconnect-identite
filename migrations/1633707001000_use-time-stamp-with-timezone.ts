import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE moderations
ALTER COLUMN created_at TYPE timestamp with time zone,
ALTER COLUMN moderated_at TYPE timestamp with time zone;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE moderations
ALTER COLUMN created_at TYPE timestamp without time zone,
ALTER COLUMN moderated_at TYPE timestamp without time zone;
`);
}
