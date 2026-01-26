import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN is_external boolean default FALSE;
`);

  await pgm.db.query(`
ALTER TABLE organizations
ADD COLUMN external_authorized_email_domains character varying[] DEFAULT '{}'::character varying[];
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN is_external;
`);

  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN external_authorized_email_domains;
`);
}
