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
  await pgm.db.query(`
    ALTER TABLE users_organizations
    DROP COLUMN is_executive,
    DROP COLUMN is_executive_verified_at;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users_organizations
    ADD COLUMN is_executive boolean DEFAULT FALSE NOT NULL,
    ADD COLUMN is_executive_verified_at TIMESTAMP WITH TIME ZONE;
  `);
};
