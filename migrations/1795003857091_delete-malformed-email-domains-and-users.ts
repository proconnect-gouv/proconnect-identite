import type { MigrationBuilder } from "node-pg-migrate";

const DOMAIN_PATTERN = String.raw`^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$`;
const EMAIL_PATTERN = String.raw`^(([^<>()\[\]\\.,;:[:space:]@"]+(\.[^<>()\[\]\\.,;:[:space:]@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}))$`;

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(
    `
DELETE FROM email_domains
WHERE domain !~ $1;
`,
    [DOMAIN_PATTERN],
  );

  await pgm.db.query(
    `
DELETE FROM users
WHERE last_sign_in_at IS NULL
  AND email !~ $1;
`,
    [EMAIL_PATTERN],
  );
}

export async function down(): Promise<void> {}
