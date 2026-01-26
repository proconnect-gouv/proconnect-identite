import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Remove duplicate records
  await pgm.db.query(`
    WITH cte AS (SELECT id,
                        ROW_NUMBER()
                        OVER (PARTITION BY organization_id, domain, verification_type ORDER BY updated_at DESC) AS rn
                 FROM email_domains)
    DELETE
    FROM email_domains
    WHERE id IN (SELECT id
                 FROM cte
                 WHERE rn > 1);
  `);

  // Remove unverified domains if a verified equivalent exists
  await pgm.db.query(`
    DELETE FROM email_domains ed
    WHERE ed.verification_type IS NULL
      AND EXISTS (
      SELECT 1
      FROM email_domains ed_verified
      WHERE ed_verified.organization_id = ed.organization_id
        AND ed_verified.domain = ed.domain
        AND ed_verified.verification_type IN ('verified', 'trackdechets_postal_mail', 'external')
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    INSERT INTO email_domains (organization_id, domain, verification_type, created_at, updated_at)
    SELECT organization_id, domain, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    FROM email_domains
    WHERE verification_type = 'verified';
  `);
}
