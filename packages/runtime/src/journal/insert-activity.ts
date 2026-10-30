//

import type {
  ActivityOf,
  ActivityTargets,
  ContextMap,
  RuntimeContext,
} from "#src/activity";
import type { IdentiteTransaction } from "#src/database";
import { activity_logs } from "@proconnect-gouv/proconnect.identite.database/drizzle";

//

export async function insertActivity<Contexts extends ContextMap>(
  tx: IdentiteTransaction,
  {
    actor,
    app,
    ...activity
  }: ActivityOf<Contexts> &
    ActivityTargets &
    Pick<RuntimeContext, "actor" | "app"> & { cause_activity_id?: number },
) {
  const [row] = await tx
    .insert(activity_logs)
    .values({ ...activity, ...toActorColumns({ actor, app }) })
    .returning({ id: activity_logs.id });

  return { activity_id: row.id };
}

function toActorColumns({ actor, app }: Pick<RuntimeContext, "actor" | "app">) {
  switch (actor.type) {
    case "app":
      return { actor_ref: actor.job, actor_type: "app", app } as const;
    case "moderator":
      return { actor_ref: actor.sub, actor_type: "moderator", app } as const;
    case "user":
      return {
        actor_ref: String(actor.user_id),
        actor_type: "user",
        app,
      } as const;
    default: {
      const unhandled_actor: never = actor;
      throw new Error(`Unhandled actor: ${JSON.stringify(unhandled_actor)}`);
    }
  }
}
