import { type ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users
    ADD COLUMN deleted_at timestamp with time zone;
  `);

  await pgm.db.query(`
    DROP INDEX index_users_on_email;
  `);

  await pgm.db.query(`
    CREATE UNIQUE INDEX users_email_unique_active_idx
    ON users (email)
    WHERE deleted_at IS NULL;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    ALTER TABLE users
    DROP COLUMN deleted_at;
  `);
  await pgm.db.query(`
    DROP INDEX users_email_unique_active_idx;
  `);
  await pgm.db.query(`
    CREATE UNIQUE INDEX index_users_on_email ON users USING btree (email);
  `);
}
