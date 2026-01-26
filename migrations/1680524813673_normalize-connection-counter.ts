import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

import { isEmpty } from "lodash-es";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
      ALTER TABLE users_oidc_clients
          DROP CONSTRAINT users_oidc_clients_pkey;
  `);
  await pgm.db.query(`
      ALTER TABLE users_oidc_clients
          ADD COLUMN id SERIAL PRIMARY KEY;
  `);
  let i = 0;

  while (true) {
    // 1. get a organization
    const { rows: results } = await pgm.db.query(
      `
          SELECT id,
              user_id,
              oidc_client_id,
              created_at,
              updated_at,
              connection_count
          FROM users_oidc_clients
          ORDER BY id
          LIMIT 1 OFFSET $1`,
      [i],
    );

    if (isEmpty(results)) {
      break;
    }

    let [
      { user_id, oidc_client_id, created_at, updated_at, connection_count },
    ] = results;

    if (connection_count > 1) {
      for (let step = 1; step < connection_count; step++) {
        await pgm.db.query(
          `
INSERT INTO users_oidc_clients (user_id, oidc_client_id, created_at, updated_at)
VALUES ($1, $2, $3, $4)`,
          [user_id, oidc_client_id, created_at, updated_at],
        );
      }
    }

    i++;
  }

  await pgm.db.query(`
      ALTER TABLE users_oidc_clients
          DROP COLUMN connection_count;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
CREATE TABLE tmp_users_oidc_clients AS
SELECT
    user_id,
    oidc_client_id,
    COUNT(*) as connection_count,
    MIN(created_at) as created_at,
    MAX(updated_at) as updated_at
FROM users_oidc_clients
GROUP BY user_id, oidc_client_id;
`);
  await pgm.db.query(`
DROP TABLE users_oidc_clients;
`);
  await pgm.db.query(`
ALTER TABLE tmp_users_oidc_clients
  RENAME TO users_oidc_clients;
`);
  await pgm.db.query(`
ALTER TABLE users_oidc_clients
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN oidc_client_id SET NOT NULL,
  ALTER COLUMN connection_count SET NOT NULL,
  ALTER COLUMN connection_count SET DEFAULT 0,
  ALTER COLUMN connection_count TYPE INT,
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ADD CONSTRAINT "users_oidc_clients_oidc_client_id_fkey" FOREIGN KEY (oidc_client_id) REFERENCES oidc_clients(id) ON UPDATE CASCADE ON DELETE CASCADE,
  ADD CONSTRAINT "users_oidc_clients_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  ADD CONSTRAINT users_oidc_clients_pkey PRIMARY KEY (user_id, oidc_client_id);
`);
}
