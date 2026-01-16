exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE organizations
    ADD COLUMN cached_siege_social boolean;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE organizations
    DROP COLUMN cached_siege_social;
  `);
};
