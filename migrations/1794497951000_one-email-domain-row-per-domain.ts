import type { MigrationBuilder } from "node-pg-migrate";

//

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE email_domains
      DROP CONSTRAINT unique_organization_domain,
      ADD CONSTRAINT unique_organization_domain
        UNIQUE (organization_id, domain);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE email_domains
      DROP CONSTRAINT unique_organization_domain,
      ADD CONSTRAINT unique_organization_domain
        UNIQUE (organization_id, domain, verification_type);
  `);
}
