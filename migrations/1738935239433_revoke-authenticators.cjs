exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    DELETE FROM authenticators;
  `);
  await pgm.db.query(`
    UPDATE users
    SET force_2fa = false
    WHERE encrypted_totp_key IS NULL;
  `);
};

exports.down = async (pgm) => {};
