//

import type {
  BaseOfficialContactEmailVerification,
  DatabaseContext,
  OfficialContactEmailVerification,
} from "#src/types";

//

export function upsertOfficialContactEmailVerificationFactory({
  pg,
}: DatabaseContext) {
  return async function upsertOfficialContactEmailVerification({
    organization_id,
    user_id,
    token,
    sent_at,
  }: BaseOfficialContactEmailVerification) {
    const { rows } = await pg.query<OfficialContactEmailVerification>(
      `
        INSERT INTO official_contact_email_verifications(created_at, updated_at, organization_id, user_id, token, sent_at)
        VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $1, $2, $3, $4)
        ON CONFLICT (organization_id, user_id)
          DO UPDATE
          SET organization_id = EXCLUDED.organization_id,
              user_id         = EXCLUDED.user_id,
              token           = EXCLUDED.token,
              sent_at         = EXCLUDED.sent_at,
              updated_at      = CURRENT_TIMESTAMP
        RETURNING *
      `,
      [organization_id, user_id, token, sent_at],
    );

    return rows.shift()!;
  };
}
