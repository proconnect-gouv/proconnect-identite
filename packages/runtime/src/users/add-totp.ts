//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { eq, sql } from "drizzle-orm";

//

type AddTotpOutcome = {
  kind: "totp_added";
  activity_id: number;
  previous: { totp_configured: boolean };
};

export function addTotpFactory({ actor, app, db }: RuntimeContext) {
  return function addTotp({
    encrypted_totp_key,
    user_id,
  }: {
    encrypted_totp_key: string;
    user_id: number;
  }): Promise<AddTotpOutcome> {
    return db.transaction(async (tx) => {
      const [previous] = await tx
        .select({
          totp_configured: sql<boolean>`${users.encrypted_totp_key} is not null`,
        })
        .from(users)
        .where(eq(users.id, user_id))
        .for("update");

      if (!previous) {
        throw new UserNotFoundError("User not found");
      }

      await tx
        .update(users)
        .set({
          encrypted_totp_key,
          totp_key_verified_at: sql`now()`,
          updated_at: sql`now()`,
        })
        .where(eq(users.id, user_id));

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "user.totp_added",
        actor,
        app,
        context: { inputs: {}, outcome: { previous } },
        user_id,
      });

      return { kind: "totp_added", activity_id, previous };
    });
  };
}
