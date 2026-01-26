import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
CREATE TABLE organizations (
    id serial PRIMARY KEY,
    siret character varying NOT NULL
);
`);

  await pgm.db.query(`
CREATE TABLE users_organizations (
    user_id int REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    -- no cascade deletion here because if we delete an organization we have to make sure it has no member
    organization_id int REFERENCES organizations (id) ON UPDATE CASCADE,
    CONSTRAINT users_organizations_pkey PRIMARY KEY (user_id, organization_id)
);
`);

  await pgm.db.query(`
CREATE UNIQUE INDEX index_organizations_on_siret ON organizations USING btree (siret);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
DROP TABLE users_organizations;
`);
  await pgm.db.query(`
DROP TABLE organizations;
`);
}
