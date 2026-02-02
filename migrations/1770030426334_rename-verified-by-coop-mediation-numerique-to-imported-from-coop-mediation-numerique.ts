import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    UPDATE users_organizations
    SET verification_type = 'imported_from_coop_mediation_numerique'
    WHERE verification_type = 'verified_by_coop_mediation_numerique';
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    UPDATE users_organizations
    SET verification_type = 'verified_by_coop_mediation_numerique'
    WHERE verification_type = 'imported_from_coop_mediation_numerique';
  `);
}
