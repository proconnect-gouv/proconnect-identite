import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`    
CREATE TABLE oidc_clients (
    id serial NOT NULL,
    name character varying NOT NULL,
    client_id character varying NOT NULL,
    client_secret character varying NOT NULL,
    redirect_uris character varying[] DEFAULT '{}'::character varying[],
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);`);

  await pgm.db.query(` 
ALTER TABLE ONLY oidc_clients
    ADD CONSTRAINT oidc_clients_pkey PRIMARY KEY (id);
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`DROP TABLE oidc_clients;`);
}
