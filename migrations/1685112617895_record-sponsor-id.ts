import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

/* eslint-disable camelcase */

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_organizations
ADD COLUMN sponsor_id int REFERENCES users ON DELETE SET NULL
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users_organizations
DROP COLUMN sponsor_id
  `);
}
