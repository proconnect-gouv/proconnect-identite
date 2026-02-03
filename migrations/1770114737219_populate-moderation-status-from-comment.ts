import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    UPDATE moderations
    SET status = CASE
      -- Extract last line: reverse, get first part before newline, reverse back
      WHEN reverse(split_part(reverse(comment), chr(10), 1)) LIKE '%Validé par%'
        THEN 'accepted'
      WHEN reverse(split_part(reverse(comment), chr(10), 1)) LIKE '%Rejeté par%'
        THEN 'rejected'
      WHEN reverse(split_part(reverse(comment), chr(10), 1)) LIKE '%Réouverte par%'
        THEN 'pending'
      -- If no comment but moderated_at is NULL, it's pending
      WHEN comment IS NULL AND moderated_at IS NULL
        THEN 'pending'
      -- Keep unknown as fallback
      ELSE 'unknown'
    END
    WHERE status = 'unknown';
  `);
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
