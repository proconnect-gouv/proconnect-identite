import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    CREATE TABLE email_domains
    (
      id                SERIAL PRIMARY KEY,
      organization_id   INTEGER NOT NULL,
      domain            VARCHAR(255) NOT NULL,
      verification_type VARCHAR(255),
      can_be_suggested  BOOLEAN NOT NULL DEFAULT true,
      verified_at       TIMESTAMP WITH TIME ZONE,
      created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
    );
  `);

  await pgm.db.query(`
    INSERT INTO email_domains
      (organization_id, domain, verification_type, created_at, updated_at, verified_at)
    SELECT id, unnest(verified_email_domains), 'verified', created_at, updated_at, updated_at
    FROM organizations;
  `);

  await pgm.db.query(`
    INSERT INTO email_domains
      (organization_id, domain, verification_type, created_at, updated_at)
    SELECT id, unnest(authorized_email_domains), NULL, created_at, updated_at
    FROM organizations;
  `);

  await pgm.db.query(`
    INSERT INTO email_domains
      (organization_id, domain, verification_type, created_at, updated_at, verified_at)
    SELECT id, unnest(external_authorized_email_domains), 'external', created_at, updated_at, updated_at
    FROM organizations;
  `);

  await pgm.db.query(`
    INSERT INTO email_domains
      (organization_id, domain, verification_type, created_at, updated_at, verified_at)
    SELECT id, unnest(trackdechets_email_domains), 'trackdechets_postal_mail', created_at, updated_at, updated_at
    FROM organizations;
  `);

  await pgm.db.query(`
    ALTER TABLE organizations
      DROP COLUMN verified_email_domains,
      DROP COLUMN authorized_email_domains,
      DROP COLUMN external_authorized_email_domains,
      DROP COLUMN trackdechets_email_domains;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE organizations
      ADD COLUMN verified_email_domains            varchar[] DEFAULT '{}'::varchar[] NOT NULL,
      ADD COLUMN authorized_email_domains          varchar[] DEFAULT '{}'::varchar[] NOT NULL,
      ADD COLUMN external_authorized_email_domains varchar[] DEFAULT '{}'::varchar[] NOT NULL,
      ADD COLUMN trackdechets_email_domains        varchar[] DEFAULT '{}'::varchar[] NOT NULL;
  `);

  await pgm.db.query(`
    UPDATE organizations o
    SET verified_email_domains = ARRAY(
      SELECT domain
      FROM email_domains
      WHERE o.id = organization_id
        AND verification_type = 'verified')
    FROM email_domains ed
    WHERE o.id = ed.organization_id;
  `);

  await pgm.db.query(`
    UPDATE organizations o
    SET authorized_email_domains = ARRAY(
      SELECT domain
      FROM email_domains
      WHERE o.id = organization_id
        AND verification_type IS NULL)
    FROM email_domains ed
    WHERE o.id = ed.organization_id;
  `);

  await pgm.db.query(`
    UPDATE organizations o
    SET external_authorized_email_domains = ARRAY(
      SELECT domain
      FROM email_domains
      WHERE o.id = organization_id
        AND verification_type = 'external')
    FROM email_domains ed
    WHERE o.id = ed.organization_id;
  `);

  await pgm.db.query(`
    UPDATE organizations o
    SET trackdechets_email_domains = ARRAY(
      SELECT domain
      FROM email_domains
      WHERE o.id = organization_id
        AND verification_type = 'trackdechets_postal_mail')
    FROM email_domains ed
    WHERE o.id = ed.organization_id;
  `);

  await pgm.db.query(`DROP TABLE email_domains;`);
}
