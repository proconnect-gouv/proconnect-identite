/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = async (pgm) => {
  const emailDomains = await pgm.db.query(`
    SELECT id, organization_id, domain, verification_type
    FROM email_domains;
`);
  const aggregatedDomains = {};
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
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {};
