import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const emailDomains = await pgm.db.query(`
    SELECT id, organization_id, domain, verification_type
    FROM email_domains;
`);
  const aggregatedDomains: Record<
    string,
    { id: number; verification_type: string | null }[]
  > = {};
  for (const emailDomain of emailDomains.rows) {
    const { id, organization_id, domain, verification_type } = emailDomain;
    const key = `${organization_id}-${domain}`;

    if (aggregatedDomains[key]) {
      aggregatedDomains[key].push({ id, verification_type });
    } else {
      aggregatedDomains[key] = [{ id, verification_type }];
    }
  }
  const idsToDelete = [];

  for (const emailDomains of Object.values(aggregatedDomains)) {
    if (
      emailDomains.length > 1 &&
      emailDomains.some((emailDomain) => emailDomain.verification_type === null)
    ) {
      idsToDelete.push(
        ...emailDomains
          .filter((emailDomain) => emailDomain.verification_type === null)
          .map((emailDomain) => emailDomain.id),
      );
    }
  }
  if (idsToDelete.length === 0) {
    return;
  }
  await pgm.db.query(`
    DELETE FROM email_domains
    WHERE id IN (${idsToDelete.join(",")});
  `);
}

export function down(_pgm: MigrationBuilder): void {}
