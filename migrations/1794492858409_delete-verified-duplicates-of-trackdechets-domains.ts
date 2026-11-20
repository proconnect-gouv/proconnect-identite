import type { MigrationBuilder } from "node-pg-migrate";

//

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(
    `
WITH removed AS (
  DELETE FROM email_domains ed
  USING email_domains trackdechets
  WHERE ed.verification_type = 'verified'
    AND trackdechets.verification_type = 'trackdechets_postal_mail'
    AND trackdechets.organization_id = ed.organization_id
    AND trackdechets.domain = ed.domain
    AND trackdechets.created_at::date = ed.created_at::date
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
    ["migration.delete-verified-duplicates-of-trackdechets-domains"],
  );
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
