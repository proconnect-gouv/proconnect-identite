import type { MigrationBuilder } from "node-pg-migrate";

//

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(
    `
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY organization_id, domain
      ORDER BY created_at::date DESC, verification_type = 'verified' DESC
    ) AS rank
  FROM email_domains
  WHERE verification_type IN ('external', 'verified')
),
removed AS (
  DELETE FROM email_domains ed
  USING ranked
  WHERE ed.id = ranked.id
    AND ranked.rank > 1
  RETURNING ed.id, ed.organization_id, ed.domain, ed.verification_type
)
INSERT INTO activity_logs (action, actor_ref, actor_type, app, context, organization_id)
SELECT
  'domain.removed',
  $1,
  'app',
  'proconnect-identite',
  jsonb_build_object(
    'inputs', jsonb_build_object('domain', domain),
    'outcome', jsonb_build_object('email_domain_id', id, 'previous_verification_type', verification_type)
  ),
  organization_id
FROM removed;
`,
    ["migration.delete-external-duplicates-of-verified-domains"],
  );
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
