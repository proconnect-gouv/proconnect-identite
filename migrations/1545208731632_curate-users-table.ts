import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users 
DROP COLUMN remember_created_at,
DROP COLUMN current_sign_in_at,
DROP COLUMN current_sign_in_ip,
DROP COLUMN last_sign_in_ip,
DROP COLUMN account_type_id,
DROP COLUMN type;
`);
  await pgm.db.query(`
ALTER TABLE users 
ADD COLUMN legacy_user boolean DEFAULT FALSE;
`);
  await pgm.db.query(`
UPDATE users
SET legacy_user = TRUE;
`);
  await pgm.db.query(`
ALTER TABLE users
ALTER COLUMN reset_password_sent_at type timestamp with time zone,
ALTER COLUMN last_sign_in_at type timestamp with time zone,
ALTER COLUMN created_at type timestamp with time zone,
ALTER COLUMN updated_at type timestamp with time zone;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users
ALTER COLUMN reset_password_sent_at type timestamp without time zone,
ALTER COLUMN last_sign_in_at type timestamp without time zone,
ALTER COLUMN created_at type timestamp without time zone,
ALTER COLUMN updated_at type timestamp without time zone;
`);

  await pgm.db.query(`
ALTER TABLE users 
DROP COLUMN legacy_user;
`);

  await pgm.db.query(`
ALTER TABLE users 
ADD COLUMN remember_created_at timestamp without time zone,
ADD COLUMN current_sign_in_at timestamp without time zone,
ADD COLUMN current_sign_in_ip character varying,
ADD COLUMN last_sign_in_ip character varying,
ADD COLUMN account_type_id integer,
ADD COLUMN type character varying;
`);
}
