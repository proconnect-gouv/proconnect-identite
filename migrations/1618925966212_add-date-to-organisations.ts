import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN created_at timestamp with time zone NOT NULL DEFAULT timestamp 'epoch',
ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT timestamp 'epoch';
`);
  await pgm.db.query(`
ALTER TABLE organizations
ADD COLUMN created_at timestamp with time zone NOT NULL DEFAULT timestamp 'epoch',
ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT timestamp 'epoch';
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN created_at,
DROP COLUMN updated_at;
`);
  await pgm.db.query(`
ALTER TABLE organizations
DROP COLUMN created_at,
DROP COLUMN updated_at;
`);
}
