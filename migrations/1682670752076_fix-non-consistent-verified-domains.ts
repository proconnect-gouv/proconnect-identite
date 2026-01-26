import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

import { difference } from "lodash-es";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const { rows } = await pgm.db.query(
    `
SELECT id FROM organizations
WHERE NOT (authorized_email_domains @> verified_email_domains)
ORDER BY id`,
  );

  const ids = rows.map(({ id }) => id);

  for (const id of ids) {
    // get organizations which have verified domains not included in authorized domain
    const { rows: results } = await pgm.db.query(
      `
SELECT verified_email_domains, authorized_email_domains
FROM organizations
WHERE id = $1`,
      [id],
    );

    let [{ verified_email_domains, authorized_email_domains }] = results;

    const missingAuthorizedDomains = difference(
      verified_email_domains,
      authorized_email_domains,
    );
    for (const missingAuthorizedDomain of missingAuthorizedDomains) {
      await pgm.db.query(
        `
UPDATE organizations
SET authorized_email_domains = array_append(authorized_email_domains, $2)
WHERE id = $1`,
        [id, missingAuthorizedDomain],
      );
    }
  }
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
