exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
CREATE TYPE moderation_type AS ENUM('organization_join_block');
  `);
  await pgm.db.query(`
CREATE TABLE moderations (
    id serial,
    user_id int NOT NULL,
    organization_id int NOT NULL,
    type moderation_type,
    created_at timestamp NOT NULL DEFAULT NOW(),
    moderated_at timestamp,
    PRIMARY KEY(id),
    FOREIGN KEY(user_id)
	REFERENCES users(id)
	ON DELETE CASCADE,
    FOREIGN KEY(organization_id)
	REFERENCES organizations(id)
	ON DELETE CASCADE
);`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`DROP TABLE moderations; DROP TYPE moderation_type;`);
};
