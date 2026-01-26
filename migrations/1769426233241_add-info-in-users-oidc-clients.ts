import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users_oidc_clients
    ADD COLUMN sp_name character varying,
    ADD COLUMN user_ip_address character varying;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users_oidc_clients
    DROP COLUMN sp_name,
    DROP COLUMN user_ip_address;
  `);
}
