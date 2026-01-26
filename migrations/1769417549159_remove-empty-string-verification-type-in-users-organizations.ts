import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    UPDATE users_organizations
    SET verification_type = 'domain_not_verified_yet'
    WHERE verification_type = '';
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    UPDATE users_organizations
    SET verification_type = ''
    WHERE verification_type = 'domain_not_verified_yet';
  `);
}
