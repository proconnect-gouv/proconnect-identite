exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
CREATE TABLE users (
    id serial NOT NULL,
    email character varying DEFAULT ''::character varying NOT NULL,
    encrypted_password character varying DEFAULT ''::character varying NOT NULL,
    reset_password_token character varying,
    reset_password_sent_at timestamp without time zone,
    remember_created_at timestamp without time zone,
    sign_in_count integer DEFAULT 0 NOT NULL,
    current_sign_in_at timestamp without time zone,
    last_sign_in_at timestamp without time zone,
    current_sign_in_ip character varying,
    last_sign_in_ip character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    account_type_id integer,
    roles character varying[] DEFAULT '{}'::character varying[],
    type character varying
);`);

  await pgm.db.query(`
ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
`);

  await pgm.db.query(`
CREATE UNIQUE INDEX index_users_on_email ON users USING btree (email);
`);

  await pgm.db.query(`
CREATE UNIQUE INDEX index_users_on_reset_password_token ON users USING btree (reset_password_token);
`);

  // We start incrementing user id at 5000 because of a previous database migration that
  // had ids from 1 to approx 3000. This avoids any conflict between old and new ids.
  await pgm.db.query(`
ALTER SEQUENCE users_id_seq RESTART WITH 5000;
  `);
};

exports.down = async (pgm) => {
  await pgm.db.query(`DROP TABLE users;`);
};
