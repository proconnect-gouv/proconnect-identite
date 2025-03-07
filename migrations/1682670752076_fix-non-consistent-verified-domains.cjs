const { isEmpty, difference } = require("lodash");
exports.shorthands = undefined;

exports.up = async (pgm) => {
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
};

exports.down = async (pgm) => {};
