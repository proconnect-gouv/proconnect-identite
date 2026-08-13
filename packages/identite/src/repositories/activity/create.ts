//

import type { DatabaseContext } from "#src/types";
import {
  activityContextSchema,
  type ActivityContext,
} from "./context-schema.js";

//

type CreateActivityParams = ActivityContext & {
  actor_user_id?: number;
  actor_email?: string;
  actor_type?: string;
  target_type?: string;
  target_id?: number;
};

export function createActivityFactory({ pg }: DatabaseContext) {
  return async function createActivity(params: CreateActivityParams) {
    const { action, context } = activityContextSchema.parse(params);
    const {
      actor_user_id = null,
      actor_email = null,
      actor_type = "system",
      target_type = null,
      target_id = null,
    } = params;

    await pg.query(
      `
      INSERT INTO activity_logs
        (action, actor_user_id, actor_email, actor_type, target_type, target_id, context)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        action,
        actor_user_id,
        actor_email,
        actor_type,
        target_type,
        target_id,
        context,
      ],
    );
  };
}

export type CreateActivityHandler = ReturnType<typeof createActivityFactory>;
