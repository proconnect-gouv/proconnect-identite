import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE authenticators
      ADD COLUMN display_name character varying,
      ADD COLUMN created_at   timestamp with time zone NOT NULL DEFAULT NOW(),
      ADD COLUMN last_used_at timestamp with time zone;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE authenticators
      DROP COLUMN display_name,
      DROP COLUMN created_at,
      DROP COLUMN last_used_at;
  `);
}
