import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
ALTER TABLE moderations
ALTER COLUMN type TYPE character varying;
  `);
  await pgm.db.query(`
DROP TYPE moderation_type;
`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
CREATE TYPE moderation_type AS ENUM('organization_join_block');
ALTER TABLE moderations
ALTER COLUMN type TYPE moderation_type
USING (type::moderation_type);
`);
}
