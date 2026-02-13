import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    UPDATE users_organizations uo
    SET verification_type = 'domain'
    FROM users u, email_domains ed
    WHERE uo.user_id = u.id
      AND ed.organization_id = uo.organization_id
      AND ed.domain = split_part(u.email, '@', 2)
      AND ed.verification_type = 'verified'
      AND uo.verification_type = 'domain_not_verified_yet';
  `);
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
