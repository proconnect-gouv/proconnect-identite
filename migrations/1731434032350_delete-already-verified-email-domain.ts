import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    DELETE
    FROM
      email_domains
    WHERE
      verification_type IS NULL
      AND (organization_id, domain) IN (
        SELECT
          organization_id,
          domain
        FROM
          email_domains
        GROUP BY
          organization_id,
          domain
        HAVING
          COUNT(
            CASE
              WHEN verification_type IS NULL THEN 1
            END
          ) > 0
          AND COUNT(
            CASE
              WHEN verification_type IS NOT NULL THEN 1
            END
          ) > 0
      );
  `);
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
