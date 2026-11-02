//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { eq, sql } from "drizzle-orm";

//

type PasswordSource = "reset_password" | "signup";

type ChangePasswordOutcome = {
  kind: "password_changed";
  activity_id: number;
  previous: { email_verified: boolean };
};

export function changePasswordFactory({ actor, app, db }: RuntimeContext) {
  return function changePassword({
    encrypted_password,
    source,
    user_id,
  }: {
    encrypted_password: string;
    source: PasswordSource;
    user_id: number;
  }): Promise<ChangePasswordOutcome> {
    return db.transaction(async (tx) => {
      const [previous] = await tx
        .select({ email_verified: users.email_verified })
        .from(users)
        .where(eq(users.id, user_id))
        .for("update");

      if (!previous) {
        throw new UserNotFoundError(`user ${user_id} not found`);
      }

      await tx
        .update(users)
        .set({
          email_verified: source === "reset_password",
          email_verified_at: source === "reset_password" ? sql`now()` : null,
          encrypted_password,
          reset_password_sent_at:
            source === "reset_password" ? null : undefined,
          reset_password_token: source === "reset_password" ? null : undefined,
          updated_at: sql`now()`,
        })
        .where(eq(users.id, user_id));

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "user.password_changed",
        actor,
        app,
        context: { inputs: { source }, outcome: { previous } },
        user_id,
      });

      return { kind: "password_changed", activity_id, previous };
    });
  };
}
