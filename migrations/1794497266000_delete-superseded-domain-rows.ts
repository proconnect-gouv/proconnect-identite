import type { MigrationBuilder } from "node-pg-migrate";

//

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(
    `
WITH superseded AS (
  SELECT DISTINCT ed.id
  FROM email_domains ed
  JOIN email_domains other
    ON other.organization_id = ed.organization_id
   AND other.domain = ed.domain
   AND other.id <> ed.id
  WHERE (ed.verification_type, other.verification_type) IN (
          ('not_verified_yet', 'verified'),
          ('external', 'trackdechets_postal_mail'))
     OR (ed.verification_type, other.verification_type) IN (
          ('official_contact', 'verified'),
          ('verified', 'official_contact'))
        AND other.updated_at > ed.updated_at
),
removed AS (
  DELETE FROM email_domains ed
  USING superseded
  WHERE ed.id = superseded.id
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
    ["migration.delete-superseded-domain-rows"],
  );
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
