import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

/* eslint-disable camelcase */

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
      ALTER TABLE users_oidc_clients
          ADD COLUMN organization_id int REFERENCES organizations (id)
              ON UPDATE CASCADE ON DELETE SET NULL;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
      ALTER TABLE users_oidc_clients
          DROP COLUMN organization_id;
  `);
}
