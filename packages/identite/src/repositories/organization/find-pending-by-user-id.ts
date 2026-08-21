//

import type { DatabaseContext } from "#src/types";
import { ModerationTypeSchema, type Organization } from "#src/types";
import { type QueryResult } from "pg";

//

export function findPendingByUserIdFactory({ pg }: DatabaseContext) {
  return async function findPendingByUserId(user_id: number) {
    const { rows }: QueryResult<Organization & { moderation_id: number }> =
      await pg.query(
        `
SELECT o.*, m.id as moderation_id
FROM moderations m
INNER JOIN organizations o on o.id = m.organization_id
WHERE m.user_id = $1
AND m.type = $2
AND m.moderated_at IS NULL
ORDER BY m.created_at
`,
        [user_id, ModerationTypeSchema.enum.organization_join_block],
      );

    return rows;
  };
}
