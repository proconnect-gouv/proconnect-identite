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
  // Apply audit trigger to users table
  await pgm.db.query(`
    CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
  `);

  // Apply audit trigger to organizations table
  await pgm.db.query(`
    CREATE TRIGGER audit_organizations
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
  `);

  // Apply audit trigger to users_organizations table
  await pgm.db.query(`
    CREATE TRIGGER audit_users_organizations
    AFTER INSERT OR UPDATE OR DELETE ON users_organizations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = async (pgm) => {
  await pgm.db.query(`DROP TRIGGER IF EXISTS audit_users_organizations ON users_organizations;`);
  await pgm.db.query(`DROP TRIGGER IF EXISTS audit_organizations ON organizations;`);
  await pgm.db.query(`DROP TRIGGER IF EXISTS audit_users ON users;`);
};
