/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  return pgm.db.query(`
    DELETE
    FROM
      email_domains
    WHERE
      verification_type IS NULL
      AND (organization_id, domain) IN (
        SELECT
          organization_id,
          domain
        FROM
          email_domains
        GROUP BY
          organization_id,
          domain
        HAVING
          COUNT(
            CASE
              WHEN verification_type IS NULL THEN 1
            END
          ) > 0
          AND COUNT(
            CASE
              WHEN verification_type IS NOT NULL THEN 1
            END
          ) > 0
      );
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {};
