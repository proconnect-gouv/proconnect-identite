import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users 
ADD COLUMN email_verified boolean NOT NULL DEFAULT FALSE,
ADD COLUMN verify_email_token character varying,
ADD COLUMN verify_email_sent_at timestamp with time zone;
`);

  await pgm.db.query(`
CREATE UNIQUE INDEX index_users_on_verify_email_token ON users USING btree (verify_email_token);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users 
DROP COLUMN email_verified,
DROP COLUMN verify_email_token,
DROP COLUMN verify_email_sent_at;
`);
}
