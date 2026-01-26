import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    CREATE TABLE franceconnect_userinfo (
      user_id INTEGER UNIQUE PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,

      birthdate          TIMESTAMP WITH TIME ZONE,
      birthplace         VARCHAR(255),
      family_name        VARCHAR(255),
      gender             VARCHAR(255),
      given_name         VARCHAR(255),
      preferred_username VARCHAR(255),
      sub                VARCHAR(255),

      created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`DROP TABLE franceconnect_userinfo;`);
}
