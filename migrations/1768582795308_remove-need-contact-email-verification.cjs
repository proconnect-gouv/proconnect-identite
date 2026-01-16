exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users_organizations
    DROP COLUMN needs_official_contact_email_verification;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`
    ALTER TABLE users_organizations
    ADD COLUMN needs_official_contact_email_verification boolean NOT NULL DEFAULT FALSE;
`);
};
