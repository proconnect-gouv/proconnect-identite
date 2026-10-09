//

import {
  ModerationStatusSchema,
  type DatabaseContext,
  type Moderation,
  type ModerationType,
} from "#src/types";
import { type QueryResult } from "pg";

//

export function createModerationFactory({ pg }: DatabaseContext) {
  return async function createModeration({
    user_id,
    organization_id,
    sp_name,
    type,
    ticket_id,
  }: {
    user_id: number;
    organization_id: number;
    sp_name?: string;
    type: ModerationType;
    ticket_id: string | null;
  }) {
    const { rows }: QueryResult<Moderation> = await pg.query(
      `
INSERT INTO moderations (user_id, organization_id, status, type, ticket_id, sp_name, allow_editing)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;`,
      [
        user_id,
        organization_id,
        ModerationStatusSchema.enum.pending,
        type,
        ticket_id,
        sp_name ?? null,
        false,
      ],
    );

    return rows.shift()!;
  };
}
