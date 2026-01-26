import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

/* eslint-disable camelcase */

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE oidc_clients
ADD COLUMN id_token_signed_response_alg character varying
`);
  await pgm.db.query(`
ALTER TABLE oidc_clients
ADD COLUMN authorization_signed_response_alg character varying
`);
  await pgm.db.query(`
ALTER TABLE oidc_clients
ADD COLUMN introspection_signed_response_alg character varying
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE oidc_clients
DROP COLUMN id_token_signed_response_alg
  `);
  await pgm.db.query(`
ALTER TABLE oidc_clients
DROP COLUMN authorization_signed_response_alg
`);
  await pgm.db.query(`
ALTER TABLE oidc_clients
DROP COLUMN introspection_signed_response_alg
`);
}
