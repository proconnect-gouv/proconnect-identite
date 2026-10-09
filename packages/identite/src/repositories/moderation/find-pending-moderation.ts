//

import {
  type DatabaseContext,
  type Moderation,
  type ModerationType,
} from "#src/types";
import { type QueryResult } from "pg";

//

export function findPendingModerationFactory({ pg }: DatabaseContext) {
  return async function findPendingModeration({
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
  AND moderated_at IS NULL;`,
      [user_id, organization_id, type],
    );

    return rows.shift();
  };
}
