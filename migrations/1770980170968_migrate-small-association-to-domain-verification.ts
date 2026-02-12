import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    WITH updated_users AS (
      UPDATE users_organizations uo
      SET verification_type = 'domain'
      FROM users u, email_domains ed
      WHERE uo.user_id = u.id
        AND ed.organization_id = uo.organization_id
        AND ed.domain = split_part(u.email, '@', 2)
        AND ed.verification_type = 'verified'
        AND uo.verification_type = 'no_verification_means_for_small_association'
      RETURNING uo.user_id
    )
    DELETE FROM franceconnect_userinfo
    WHERE user_id IN (SELECT user_id FROM updated_users);
  `);
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
