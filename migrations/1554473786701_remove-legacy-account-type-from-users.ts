import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
UPDATE users SET roles = array_append(roles, legacy_account_type)
WHERE legacy_account_type <> 'service_provider';
`);

  await pgm.db.query(`
ALTER TABLE users
DROP COLUMN legacy_account_type;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE users
ADD COLUMN legacy_account_type character varying;
`);

  await pgm.db.query(`
UPDATE users SET legacy_account_type = roles[array_upper(roles, 1)];
`);

  await pgm.db.query(`
UPDATE users SET roles = array_remove(roles, legacy_account_type);
`);

  await pgm.db.query(`
UPDATE users SET legacy_account_type = 'service_provider'
WHERE legacy_account_type IS NULL;
`);
}
