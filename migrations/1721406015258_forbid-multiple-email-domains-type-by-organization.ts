import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE email_domains
      ADD CONSTRAINT unique_organization_domain
        UNIQUE (organization_id, domain, verification_type);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE email_domains
      DROP CONSTRAINT unique_organization_domain;
  `);
}
