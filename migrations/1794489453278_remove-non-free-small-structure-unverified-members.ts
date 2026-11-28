import { isAFreeDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { LinkEnum } from "@proconnect-gouv/proconnect.identite/types";
import type { MigrationBuilder } from "node-pg-migrate";
import { z } from "zod";

//

const SMALL_STRUCTURE_LINK_TYPES = [
  LinkEnum.enum.no_verification_means_for_small_association,
  LinkEnum.enum.no_verification_means_for_small_organization,
];

const MemberSchema = z.object({
  email: z.string(),
  organization_id: z.number(),
  user_id: z.number(),
});

//
export async function up(pgm: MigrationBuilder): Promise<void> {
  const { rows } = await pgm.db.query(
    `
SELECT uo.user_id, uo.organization_id, u.email
FROM users_organizations uo
JOIN users u ON u.id = uo.user_id
WHERE uo.verification_type = ANY($1);
`,
    [SMALL_STRUCTURE_LINK_TYPES],
  );
  const non_free_members = z
    .array(MemberSchema)
    .parse(rows)
    .filter(({ email }) => !isAFreeDomain(email));

  await pgm.db.query(
    `
WITH removed AS (
  DELETE FROM users_organizations uo
  USING unnest($1::int[], $2::int[]) AS m (user_id, organization_id)
  WHERE uo.user_id = m.user_id
    AND uo.organization_id = m.organization_id
    AND uo.verification_type = ANY($3)
  RETURNING uo.user_id, uo.organization_id, uo.is_external, uo.verification_type
)
INSERT INTO activity_logs (action, actor_ref, actor_type, app, context, organization_id, user_id)
SELECT
  'member.removed',
  $4,
  'app',
  'proconnect-identite',
  jsonb_build_object(
    'inputs', '{}'::jsonb,
    'outcome', jsonb_build_object('is_external', is_external, 'verification_type', verification_type)
  ),
  organization_id,
  user_id
FROM removed;
`,
    [
      non_free_members.map(({ user_id }) => user_id),
      non_free_members.map(({ organization_id }) => organization_id),
      SMALL_STRUCTURE_LINK_TYPES,
      "migration.remove-non-free-small-structure-unverified-members",
    ],
  );
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
