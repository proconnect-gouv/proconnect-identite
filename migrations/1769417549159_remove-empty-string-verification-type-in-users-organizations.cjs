exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    UPDATE users_organizations
    SET verification_type = 'domain_not_verified_yet'
    WHERE verification_type = '';
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    UPDATE users_organizations
    SET verification_type = NULL
    WHERE verification_type = 'domain_not_verified_yet';
  `);
};
