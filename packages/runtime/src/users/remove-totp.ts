//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import {
  authenticators,
  users,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { eq, sql } from "drizzle-orm";

//

type RemoveTotpOutcome =
  | {
      kind: "totp_removed";
      activity_id: number;
      force_2fa_cleared: boolean;
      previous: { force_2fa: boolean };
    }
  | { kind: "totp_unchanged"; user_id: number };

export function removeTotpFactory({ actor, app, db }: RuntimeContext) {
  return function removeTotp({
    user_id,
  }: {
    user_id: number;
  }): Promise<RemoveTotpOutcome> {
    return db.transaction(async (tx) => {
      const [previous] = await tx
        .select({
          force_2fa: users.force_2fa,
          totp_configured: sql<boolean>`${users.encrypted_totp_key} is not null`,
        })
        .from(users)
        .where(eq(users.id, user_id))
        .for("update");

      if (!previous) {
        throw new UserNotFoundError("User not found");
      }

      if (!previous.totp_configured) {
        return { kind: "totp_unchanged", user_id };
      }

      await tx
        .update(users)
        .set({
          encrypted_totp_key: null,
          totp_key_verified_at: null,
          updated_at: sql`now()`,
        })
        .where(eq(users.id, user_id));

      const [passkey] = await tx
        .select({ credential_id: authenticators.credential_id })
        .from(authenticators)
        .where(eq(authenticators.user_id, user_id))
        .limit(1);

      const force_2fa_cleared = !passkey && previous.force_2fa;

      if (force_2fa_cleared) {
        await tx
          .update(users)
          .set({ force_2fa: false })
          .where(eq(users.id, user_id));
      }

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "user.totp_removed",
        actor,
        app,
        context: {
          inputs: {},
          outcome: {
            force_2fa_cleared,
            previous: { force_2fa: previous.force_2fa },
          },
        },
        user_id,
      });

      return {
        kind: "totp_removed",
        activity_id,
        force_2fa_cleared,
        previous: { force_2fa: previous.force_2fa },
      };
    });
  };
}
