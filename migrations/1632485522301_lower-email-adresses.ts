import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
      UPDATE users
      SET email = LOWER(users.email)
      FROM (
               SELECT email
               FROM users
                        LEFT OUTER JOIN (
                   SELECT LOWER(email) as lower_email
                   FROM users GROUP BY LOWER(email) HAVING COUNT(*) > 1
               ) dup ON dup.lower_email = LOWER(users.email)
               WHERE dup.lower_email IS NULL
           ) AS non_dup
      WHERE users.email = non_dup.email;`);

  await pgm.db.query(`
      update organizations
      set authorized_email_domains = lower(organizations.authorized_email_domains::text)::text[]
      from (
               select * from organizations where authorized_email_domains::text <> lower(authorized_email_domains::text)
           ) as org_err
      where org_err.id = organizations.id;
`);

  await pgm.db.query(`
      update organizations
      set external_authorized_email_domains = lower(organizations.external_authorized_email_domains::text)::text[]
      from (
               select * from organizations where external_authorized_email_domains::text <> lower(external_authorized_email_domains::text)
           ) as org_err
      where org_err.id = organizations.id;
`);
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
