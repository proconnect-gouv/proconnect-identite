//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { eq, sql } from "drizzle-orm";

//

type ResetPasswordOutcome = {
  kind: "password_reset";
  activity_id: number;
  previous: { password_configured: boolean };
};

export function resetPasswordFactory({ actor, app, db }: RuntimeContext) {
  return function resetPassword({
    user_id,
  }: {
    user_id: number;
  }): Promise<ResetPasswordOutcome> {
    return db.transaction(async (tx) => {
      const [previous] = await tx
        .select({
          password_configured: sql<boolean>`${users.encrypted_password} is not null`,
        })
        .from(users)
        .where(eq(users.id, user_id))
        .for("update");

      if (!previous) {
        throw new UserNotFoundError("User not found");
      }

      await tx
        .update(users)
        .set({ encrypted_password: null, updated_at: sql`now()` })
        .where(eq(users.id, user_id));

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "user.password_reset",
        actor,
        app,
        context: { inputs: {}, outcome: { previous } },
        user_id,
      });

      return { kind: "password_reset", activity_id, previous };
    });
  };
}
