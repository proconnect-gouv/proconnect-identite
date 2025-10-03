exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE oidc_clients
      ADD COLUMN is_proconnect_federation boolean NOT NULL DEFAULT FALSE;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE oidc_clients
      DROP COLUMN is_proconnect_federation;
  `);
};
