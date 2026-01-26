import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users
      ADD COLUMN force_2fa boolean DEFAULT FALSE NOT NULL;
  `);
  await pgm.db.query(`
    UPDATE users
    SET force_2fa = true
    WHERE users.encrypted_totp_key IS NOT NULL;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users
      DROP COLUMN force_2fa;
  `);
}
