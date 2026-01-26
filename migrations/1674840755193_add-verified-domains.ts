import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE organizations
ADD COLUMN verified_email_domains character varying[] DEFAULT '{}'::character varying[];
`);

  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN verification_type character varying;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE organizations
DROP COLUMN verified_email_domains;
`);

  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN verification_type;
`);
}
