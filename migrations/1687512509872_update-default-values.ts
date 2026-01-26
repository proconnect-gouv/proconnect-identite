import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

/* eslint-disable camelcase */

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE oidc_clients
ALTER COLUMN redirect_uris SET NOT NULL,
ALTER COLUMN post_logout_redirect_uris SET NOT NULL,
ALTER COLUMN scope SET NOT NULL`);

  await pgm.db.query(`
ALTER TABLE organizations
ALTER COLUMN authorized_email_domains SET NOT NULL,
ALTER COLUMN verified_email_domains SET NOT NULL,
ALTER COLUMN external_authorized_email_domains SET NOT NULL`);

  await pgm.db.query(`
ALTER TABLE users
ALTER COLUMN legacy_user SET NOT NULL`);

  await pgm.db.query(`
UPDATE users_organizations
SET has_been_greeted = FALSE
WHERE has_been_greeted IS NULL`);

  await pgm.db.query(`
ALTER TABLE users_organizations
ALTER COLUMN is_external SET NOT NULL,
ALTER COLUMN has_been_greeted SET DEFAULT FALSE,
ALTER COLUMN has_been_greeted SET NOT NULL`);

  await pgm.db.query(`
ALTER TABLE moderations
ALTER COLUMN type SET NOT NULL`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE oidc_clients
ALTER COLUMN redirect_uris DROP NOT NULL,
ALTER COLUMN post_logout_redirect_uris DROP NOT NULL,
ALTER COLUMN scope DROP NOT NULL`);

  await pgm.db.query(`
ALTER TABLE organizations
ALTER COLUMN authorized_email_domains DROP NOT NULL,
ALTER COLUMN verified_email_domains DROP NOT NULL,
ALTER COLUMN external_authorized_email_domains DROP NOT NULL`);

  await pgm.db.query(`
ALTER TABLE users
ALTER COLUMN legacy_user DROP NOT NULL`);

  await pgm.db.query(`
ALTER TABLE users_organizations
ALTER COLUMN is_external DROP NOT NULL,
ALTER COLUMN has_been_greeted DROP NOT NULL,
ALTER COLUMN has_been_greeted DROP DEFAULT`);

  await pgm.db.query(`
ALTER TABLE moderations
ALTER COLUMN type DROP NOT NULL`);
}
