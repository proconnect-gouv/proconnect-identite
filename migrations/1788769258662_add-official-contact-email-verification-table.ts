import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    CREATE TABLE official_contact_email_verifications (
      user_id         INTEGER NOT NULL,
      organization_id INTEGER NOT NULL,

      token   VARCHAR,
      sent_at TIMESTAMP WITH TIME ZONE,

      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

      PRIMARY KEY (user_id, organization_id),
      FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
      FOREIGN KEY (organization_id)
        REFERENCES organizations (id)
        ON DELETE CASCADE
    );
  `);

  await pgm.db.query(`
    INSERT INTO official_contact_email_verifications (
      user_id,
      organization_id,
      token,
      sent_at
    )
    SELECT
      user_id,
      organization_id,
      official_contact_email_verification_token,
      official_contact_email_verification_sent_at
    FROM users_organizations
    WHERE needs_official_contact_email_verification = true
  `);

  await pgm.db.query(`
    DELETE FROM users_organizations
    WHERE needs_official_contact_email_verification = true
  `);

  await pgm.db.query(`
    ALTER TABLE users_organizations
      DROP COLUMN official_contact_email_verification_token,
      DROP COLUMN official_contact_email_verification_sent_at,
      DROP COLUMN needs_official_contact_email_verification`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`DROP TABLE official_contact_email_verifications`);

  await pgm.db.query(`
    ALTER TABLE users_organizations
      ADD COLUMN needs_official_contact_email_verification   boolean NOT NULL DEFAULT FALSE,
      ADD COLUMN official_contact_email_verification_token   character varying,
      ADD COLUMN official_contact_email_verification_sent_at timestamp with time zone
  `);
}
