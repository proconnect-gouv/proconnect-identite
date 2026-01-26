import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN authentication_by_peers_type character varying;
`);

  await pgm.db.query(`
UPDATE users_organizations
SET authentication_by_peers_type = 'all_members_notified'`);

  await pgm.db.query(`
ALTER TABLE users
ADD COLUMN has_been_greeted_for_first_organization_join boolean DEFAULT FALSE`);

  await pgm.db.query(`
UPDATE users
SET has_been_greeted_for_first_organization_join = TRUE`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN authentication_by_peers_type`);

  await pgm.db.query(`
ALTER TABLE users
DROP COLUMN has_been_greeted_for_first_organization_join`);
}
