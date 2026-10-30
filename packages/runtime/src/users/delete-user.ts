//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";

//

type DeleteUserOutcome =
  | {
      kind: "user_deleted";
      activity_id: number;
      previous: ActivityContexts["user.deleted"]["outcome"];
    }
  | { kind: "user_not_found"; user_id: number };

export function deleteUserFactory({ actor, app, db }: RuntimeContext) {
  return function deleteUser({
    user_id,
  }: {
    user_id: number;
  }): Promise<DeleteUserOutcome> {
    return db.transaction(async (tx) => {
      const memberships = await tx.query.users_organizations.findMany({
        columns: {
          is_external: true,
          organization_id: true,
          verification_type: true,
        },
        orderBy: (table, { asc }) => asc(table.organization_id),
        where: (table, { eq }) => eq(table.user_id, user_id),
      });

      const [user] = await tx
        .delete(users)
        .where(eq(users.id, user_id))
        .returning({
          email: users.email,
          family_name: users.family_name,
          given_name: users.given_name,
        });

      if (!user) {
        return { kind: "user_not_found", user_id };
      }

      const previous = { ...user, memberships };
      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "user.deleted",
        actor,
        app,
        context: { inputs: { user_id }, outcome: previous },
        user_id,
      });

      return { kind: "user_deleted", activity_id, previous };
    });
  };
}
