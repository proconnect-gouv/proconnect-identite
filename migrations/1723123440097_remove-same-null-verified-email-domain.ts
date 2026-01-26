import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const same_email_domains = `
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY
          organization_id,
          domain
        ORDER BY
          verification_type
      ) AS count
    FROM
      email_domains
    WHERE
      verification_type IS NULL
  `;

  const ids_to_delete = `
    SELECT
      id
    FROM
      same_email_domains
    WHERE
      count > 1
  `;

  await pgm.db.query(`
    WITH
      same_email_domains AS ( ${same_email_domains} )
    DELETE
    FROM
      email_domains
    WHERE
      id IN ( ${ids_to_delete} )
  `);
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
