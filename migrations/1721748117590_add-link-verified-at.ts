import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users_organizations
      ADD COLUMN verified_at timestamp with time zone;
  `);

  await pgm.db.query(`
  UPDATE users_organizations
  SET verified_at = updated_at
  WHERE verification_type IS NOT NULL;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users_organizations
      DROP COLUMN verified_at;
  `);
}
