/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users_oidc_clients
    ADD COLUMN sp_name character varying,
    ADD COLUMN user_ip_address character varying;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users_oidc_clients
    DROP COLUMN sp_name,
    DROP COLUMN user_ip_address;
  `);
};
