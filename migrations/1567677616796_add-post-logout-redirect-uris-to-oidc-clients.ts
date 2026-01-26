import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE oidc_clients
ADD COLUMN post_logout_redirect_uris character varying[] DEFAULT '{}'::character varying[];
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE oidc_clients
DROP COLUMN post_logout_redirect_uris;
`);
}
