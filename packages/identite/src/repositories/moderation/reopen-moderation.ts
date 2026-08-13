//

import type { DatabaseContext, Moderation } from "#src/types";
import { ModerationStatusSchema } from "#src/types";
import type { QueryResult } from "pg";

//

export function reopenModerationFactory({ pg }: DatabaseContext) {
  return async function reopenModeration({
    id,
    userEmail,
    cause,
  }: {
    id: number;
    userEmail: string;
    cause: string;
  }) {
    const { rows }: QueryResult<Moderation> = await pg.query(
      `
      UPDATE
        moderations
      SET
        moderated_at = NULL,
        moderated_by = NULL,
        status = $4,
        comment = COALESCE(comment, '') || ' | Réouvert le ' || NOW()::date || ' par ' || $2 || ' - ' || $3
      WHERE
        id = $1
      RETURNING *;
      `,
      [id, userEmail, cause, ModerationStatusSchema.enum.reopened],
    );

    return rows.shift();
  };
}

export type ReopenModerationHandler = ReturnType<
  typeof reopenModerationFactory
>;
