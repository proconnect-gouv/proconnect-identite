//

import type {
  ActivityContexts,
  ActivityOf,
  ActivityTargets,
  ContextMap,
  RuntimeContext,
} from "#src/activity";
import type { IdentiteTransaction } from "#src/database";
import { activity_logs } from "@proconnect-gouv/proconnect.identite.database/drizzle";

//

type InsertableActivity = {
  action: string;
  context: unknown;
} & ActivityTargets &
  Pick<RuntimeContext, "actor" | "app"> & { cause_activity_id?: number };

export async function insertActivity<Contexts extends ContextMap>(
  tx: IdentiteTransaction,
  activity: ActivityOf<Contexts> &
    ActivityTargets &
    Pick<RuntimeContext, "actor" | "app"> & { cause_activity_id?: number },
) {
  return insertRow(tx, activity);
}

export async function insertRecordedActivity<OwnContexts extends ContextMap>(
  tx: IdentiteTransaction,
  activity: (ActivityOf<OwnContexts> | ActivityOf<ActivityContexts>) &
    ActivityTargets &
    Pick<RuntimeContext, "actor" | "app">,
) {
  return insertRow(tx, activity);
}

async function insertRow(
  tx: IdentiteTransaction,
  { actor, app, ...activity }: InsertableActivity,
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
