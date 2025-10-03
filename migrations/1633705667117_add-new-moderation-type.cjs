exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
ALTER TABLE moderations
ALTER COLUMN type TYPE character varying;
  `);
  await pgm.db.query(`
DROP TYPE moderation_type;
`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
CREATE TYPE moderation_type AS ENUM('organization_join_block');
ALTER TABLE moderations
ALTER COLUMN type TYPE moderation_type
USING (type::moderation_type);
`);
};
