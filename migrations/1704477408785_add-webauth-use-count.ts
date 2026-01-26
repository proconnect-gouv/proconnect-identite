import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE authenticators
      ADD COLUMN usage_count integer DEFAULT 0 NOT NULL;
  `);

  await pgm.db.query(`
    UPDATE authenticators
    SET counter = 0;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE authenticators
      DROP COLUMN usage_count;
  `);
}
