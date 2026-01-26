import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    DELETE FROM authenticators;
  `);
  await pgm.db.query(`
    UPDATE users
    SET force_2fa = false
    WHERE encrypted_totp_key IS NULL;
  `);
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
