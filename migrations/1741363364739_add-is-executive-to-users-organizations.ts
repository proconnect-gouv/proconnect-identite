import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users_organizations
    ADD COLUMN is_executive boolean DEFAULT FALSE NOT NULL,
    ADD COLUMN is_executive_verified_at TIMESTAMP WITH TIME ZONE;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users_organizations
    DROP COLUMN is_executive,
    DROP COLUMN is_executive_verified_at;
  `);
}
