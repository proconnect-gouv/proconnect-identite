import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    CREATE TABLE recovery_codes
    (
        id         SERIAL PRIMARY KEY,
        user_id    INT NOT NULL,
        code       TEXT NOT NULL,
        used_at    TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE CASCADE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`DROP TABLE recovery_codes;`);
}
