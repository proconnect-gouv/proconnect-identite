//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import {
  authenticators,
  users,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq, sql } from "drizzle-orm";

//

type ResetMfaOutcome =
  | {
      kind: "mfa_reset";
      activity_id: number;
      previous: ActivityContexts["user.mfa_reset"]["outcome"]["previous"];
    }
  | { kind: "user_not_found"; user_id: number };

export function resetMfaFactory({ actor, app, db }: RuntimeContext) {
  return function resetMfa({
    user_id,
  }: {
    user_id: number;
  }): Promise<ResetMfaOutcome> {
    return db.transaction(async (tx) => {
      const [previousUser] = await tx
        .select({
          email_verified: users.email_verified,
          force_2fa: users.force_2fa,
          password_configured: sql<boolean>`${users.encrypted_password} is not null`,
          totp_configured: sql<boolean>`${users.encrypted_totp_key} is not null`,
        })
        .from(users)
        .where(eq(users.id, user_id))
        .for("update");

      if (!previousUser) {
        return { kind: "user_not_found", user_id };
      }

      const removedAuthenticators = await tx
        .delete(authenticators)
        .where(eq(authenticators.user_id, user_id))
        .returning({ credential_id: authenticators.credential_id });

      await tx
        .update(users)
        .set({
          email_verified: false,
          encrypted_password: null,
          encrypted_totp_key: null,
          force_2fa: false,
          totp_key_verified_at: null,
          updated_at: sql`now()`,
        })
        .where(eq(users.id, user_id));

      const previous = {
        authenticators: removedAuthenticators.length,
        email_verified: previousUser.email_verified,
        force_2fa: previousUser.force_2fa,
        password_configured: previousUser.password_configured,
        totp_configured: previousUser.totp_configured,
      };

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "user.mfa_reset",
        actor,
        app,
        context: { inputs: { user_id }, outcome: { previous } },
        user_id,
      });

      return { kind: "mfa_reset", activity_id, previous };
    });
  };
}
