import { type ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE moderations
    ADD COLUMN end_user_reason character varying(255) NOT NULL DEFAULT 'Raison transmise par mail';
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE moderations
    DROP COLUMN end_user_reason;
  `);
}
