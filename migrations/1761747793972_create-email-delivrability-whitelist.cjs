exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
CREATE TABLE email_deliverability_whitelist (
    problematic_email character varying NOT NULL,
    email_domain character varying NOT NULL UNIQUE PRIMARY KEY,
    verified_at timestamp with time zone DEFAULT NOW() NOT NULL,
    verified_by character varying
);`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = async (pgm) => {
  await pgm.db.query(`DROP TABLE email_deliverability_whitelist;`);
};
