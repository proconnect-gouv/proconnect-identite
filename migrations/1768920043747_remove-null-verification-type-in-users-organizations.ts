import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // 1) Backfill NULLs
  await pgm.db.query(`
    UPDATE users_organizations
    SET verification_type = 'domain_not_verified_yet'
    WHERE verification_type IS NULL;
  `);

  // 2) Add NOT NULL constraint
  await pgm.db.query(`
    ALTER TABLE users_organizations
    ALTER COLUMN verification_type SET NOT NULL;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // 1) Remove NOT NULL constraint
  await pgm.db.query(`
    ALTER TABLE users_organizations
      ALTER COLUMN verification_type DROP NOT NULL;
  `);

  // 2) Revert the backfill (only the values we introduced)
  await pgm.db.query(`
    UPDATE users_organizations
    SET verification_type = NULL
    WHERE verification_type = 'domain_not_verified_yet';
  `);
}
