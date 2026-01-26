import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    UPDATE users
    SET encrypted_password = NULL
    WHERE encrypted_password = '';
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    UPDATE users
    SET encrypted_password = ''
    WHERE encrypted_password IS NULL;
  `);
}
