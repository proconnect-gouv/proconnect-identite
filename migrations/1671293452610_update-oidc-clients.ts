import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE oidc_clients
    RENAME COLUMN name TO client_name;
  `);
  await pgm.db.query(`
    ALTER TABLE oidc_clients
    ADD COLUMN client_uri character varying,
    ADD COLUMN client_description character varying;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE oidc_clients
    RENAME COLUMN client_name TO name;
  `);
  await pgm.db.query(`
    ALTER TABLE oidc_clients
    DROP COLUMN client_uri,
    DROP COLUMN client_description;
  `);
}
