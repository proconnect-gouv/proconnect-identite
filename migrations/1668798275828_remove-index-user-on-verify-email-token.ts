import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
DROP INDEX index_users_on_verify_email_token;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
CREATE UNIQUE INDEX index_users_on_verify_email_token ON users USING btree (verify_email_token);
  `);
}
