import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // 1) Backfill NULLs
  await pgm.db.query(`
    UPDATE email_domains
    SET verification_type = 'not_verified_yet'
    WHERE verification_type IS NULL;
  `);

  // 2) Add NOT NULL constraint
  await pgm.db.query(`
    ALTER TABLE email_domains
    ALTER COLUMN verification_type SET NOT NULL;
  `);

  // 3) Replace NULLS NOT DISTINCT unique constraint with regular unique constraint
  await pgm.db.query(`
    ALTER TABLE email_domains
    DROP CONSTRAINT IF EXISTS unique_organization_domain;
  `);
  await pgm.db.query(`
    ALTER TABLE email_domains
    ADD CONSTRAINT unique_organization_domain UNIQUE (organization_id, domain, verification_type);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // 1) Remove NOT NULL constraint
  await pgm.db.query(`
    ALTER TABLE email_domains
      ALTER COLUMN verification_type DROP NOT NULL;
  `);

  // 2) Restore NULLS NOT DISTINCT unique constraint
  await pgm.db.query(`
    ALTER TABLE email_domains
    DROP CONSTRAINT IF EXISTS unique_organization_domain;
  `);
  await pgm.db.query(`
    ALTER TABLE email_domains
    ADD CONSTRAINT unique_organization_domain UNIQUE NULLS NOT DISTINCT (organization_id, domain, verification_type);
  `);

  // 3) Revert the backfill (only the values we introduced)
  await pgm.db.query(`
    UPDATE email_domains
    SET verification_type = NULL
    WHERE verification_type = 'not_verified_yet';
  `);
}
