import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users
      ADD COLUMN encrypted_totp_key   character varying,
      ADD COLUMN totp_key_verified_at timestamp with time zone;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users
      DROP COLUMN encrypted_totp_key,
      DROP COLUMN totp_key_verified_at;
  `);
}
