//

import {
  ModerationStatusSchema,
  type DatabaseContext,
  type Moderation,
  type ModerationType,
} from "#src/types";
import { type QueryResult } from "pg";

//

export function findRejectedModerationFactory({ pg }: DatabaseContext) {
  return async function findRejectedModeration({
    user_id,
    organization_id,
    type,
  }: {
    user_id: number;
    organization_id: number;
    type: ModerationType;
  }) {
    const { rows }: QueryResult<Moderation> = await pg.query(
      `
SELECT *
FROM moderations
WHERE user_id = $1
  AND organization_id = $2
  AND type = $3
  AND moderated_at IS NOT NULL
  AND status = $4;`,
      [user_id, organization_id, type, ModerationStatusSchema.enum.rejected],
    );

    return rows.shift();
  };
}
