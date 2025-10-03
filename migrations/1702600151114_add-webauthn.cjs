exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
      CREATE TABLE authenticators
      (
          credential_id          TEXT    NOT NULL,
          credential_public_key  BYTEA   NOT NULL,
          counter                BIGINT  NOT NULL,
          credential_device_type CHARACTER VARYING(32),
          credential_backed_up   BOOLEAN NOT NULL,
          transports             CHARACTER VARYING(255)[] DEFAULT '{}',
          user_id                INT     NOT NULL,
          PRIMARY KEY (credential_id),
          FOREIGN KEY (user_id)
              REFERENCES users (id)
              ON DELETE CASCADE
      );
  `);

  await pgm.db.query(`
      CREATE UNIQUE INDEX index_authenticators_on_credential_id ON authenticators USING btree (credential_id);
  `);

  await pgm.db.query(`
      ALTER TABLE users
          ADD COLUMN current_challenge character varying;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`DROP TABLE authenticators;`);

  await pgm.db.query(`
      ALTER TABLE users
          DROP COLUMN current_challenge;`);
};
