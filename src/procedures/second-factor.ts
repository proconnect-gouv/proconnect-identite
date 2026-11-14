import { validatePassword } from "@proconnect-gouv/proconnect.core/security";
import {
  authenticators,
  recovery_words,
  users,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  createIdentiteRuntime,
  procedure,
  type Actor,
  type IdentiteTransaction,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { and, count, eq, sql } from "drizzle-orm";
import { TOTP } from "otpauth";
import { z } from "zod";
import { SYMMETRIC_ENCRYPTION_KEY } from "../config/env";
import { encryptSymmetric } from "../services/symmetric-encryption";

async function is2faCapable(tx: IdentiteTransaction, user_id: number) {
  const [user] = await tx
    .select({ encrypted_totp_key: users.encrypted_totp_key })
    .from(users)
    .where(eq(users.id, user_id));
  if (user?.encrypted_totp_key) return true;

  const [{ passkeys }] = await tx
    .select({ passkeys: count() })
    .from(authenticators)
    .where(eq(authenticators.user_id, user_id));
  return passkeys > 0;
}

export const userForce2faDisabled = procedure
  .inputs(activityContextSchemas["user.force_2fa_disabled"].shape.inputs)
  .private(z.object({ user_id: z.number() }))
  .outcome(activityContextSchemas["user.force_2fa_disabled"].shape.outcome)
  .mutation(async ({ private: { user_id }, tx }) => {
    const [user] = await tx
      .update(users)
      .set({ force_2fa: false, updated_at: sql`now()` })
      .where(and(eq(users.id, user_id), eq(users.force_2fa, true)))
      .returning();

    if (!user) return { kind: "force_2fa_unchanged" } as const;

    return {
      journal: { outcome: {}, targets: { user_id } },
      kind: "force_2fa_disabled",
      user,
    } as const;
  });

export const userForce2faEnabled = procedure
  .inputs(activityContextSchemas["user.force_2fa_enabled"].shape.inputs)
  .private(z.object({ user_id: z.number() }))
  .outcome(activityContextSchemas["user.force_2fa_enabled"].shape.outcome)
  .mutation(async ({ private: { user_id }, tx }) => {
    if (!(await is2faCapable(tx, user_id))) {
      return { kind: "not_2fa_capable" } as const;
    }

    const [user] = await tx
      .update(users)
      .set({ force_2fa: true, updated_at: sql`now()` })
      .where(and(eq(users.id, user_id), eq(users.force_2fa, false)))
      .returning();

    if (!user) return { kind: "force_2fa_unchanged" } as const;

    return {
      journal: { outcome: {}, targets: { user_id } },
      kind: "force_2fa_enabled",
      user,
    } as const;
  });

// Lifts forced 2FA in the caller's transaction once no second factor is left.
async function liftForce2faIfNoSecondFactor({
  actor,
  reason,
  tx,
  user_id,
}: {
  actor: Actor;
  reason: "account_recovery" | "passkey_removed" | "totp_removed";
  tx: IdentiteTransaction;
  user_id: number;
}) {
  if (await is2faCapable(tx, user_id)) return;

  await createIdentiteRuntime({
    app: "proconnect-identite",
    db: tx,
    procedures: { user: { force_2fa_disabled: userForce2faDisabled } },
  })
    .as(actor)
    .user.force_2fa_disabled.mutate({ reason, user_id });
}

export const userTotpAdded = procedure
  .inputs(activityContextSchemas["user.totp_added"].shape.inputs)
  .private(
    z.object({
      temporary_totp_key: z.string(),
      totp_token: z.string(),
      user_id: z.number(),
    }),
  )
  .outcome(activityContextSchemas["user.totp_added"].shape.outcome)
  .mutation(
    async ({ private: { temporary_totp_key, totp_token, user_id }, tx }) => {
      const totp = new TOTP({
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: temporary_totp_key,
      });
      if (totp.validate({ token: totp_token, window: 2 }) === null) {
        return { kind: "invalid_totp_token" } as const;
      }

      const [previous] = await tx
        .select({ encrypted_totp_key: users.encrypted_totp_key })
        .from(users)
        .where(eq(users.id, user_id))
        .for("update");

      if (!previous) throw new UserNotFoundError(`user ${user_id} not found`);

      const [user] = await tx
        .update(users)
        .set({
          encrypted_totp_key: encryptSymmetric(
            SYMMETRIC_ENCRYPTION_KEY,
            temporary_totp_key,
          ),
          totp_key_verified_at: sql`now()`,
          updated_at: sql`now()`,
        })
        .where(eq(users.id, user_id))
        .returning();

      return {
        journal: {
          outcome: {
            previous: {
              totp_configured: Boolean(previous?.encrypted_totp_key),
            },
          },
          targets: { user_id },
        },
        kind: "totp_added",
        user,
      } as const;
    },
  );

export const userTotpRemoved = procedure
  .inputs(activityContextSchemas["user.totp_removed"].shape.inputs)
  .private(z.object({ user_id: z.number() }))
  .outcome(activityContextSchemas["user.totp_removed"].shape.outcome)
  .mutation(async ({ actor, inputs: { source }, private: { user_id }, tx }) => {
    const [removed] = await tx
      .update(users)
      .set({
        encrypted_totp_key: null,
        totp_key_verified_at: null,
        updated_at: sql`now()`,
      })
      .where(
        and(
          eq(users.id, user_id),
          sql`${users.encrypted_totp_key} IS NOT NULL`,
        ),
      )
      .returning({ id: users.id });

    if (removed) {
      await liftForce2faIfNoSecondFactor({
        actor,
        reason: source === "self" ? "totp_removed" : source,
        tx,
        user_id,
      });
    }

    const [user] = await tx.select().from(users).where(eq(users.id, user_id));

    if (!user) throw new UserNotFoundError(`user ${user_id} not found`);

    if (!removed) return { kind: "totp_not_configured", user } as const;

    return {
      journal: { outcome: {}, targets: { user_id } },
      kind: "totp_removed",
      user,
    } as const;
  });

export const userPasskeyAdded = procedure
  .inputs(activityContextSchemas["user.passkey_added"].shape.inputs)
  .private(
    z.object({
      authenticator: z.object({
        counter: z.number(),
        credential_backed_up: z.boolean(),
        credential_device_type: z.string(),
        credential_public_key: z.instanceof(Uint8Array),
        transports: z.array(z.string()).nullable(),
        user_verified: z.boolean(),
      }),
      user_id: z.number(),
    }),
  )
  .outcome(activityContextSchemas["user.passkey_added"].shape.outcome)
  .mutation(
    async ({
      inputs: { credential_id, display_name },
      private: { authenticator, user_id },
      tx,
    }) => {
      await tx.insert(authenticators).values({
        ...authenticator,
        credential_id,
        display_name,
        last_used_at: null,
        usage_count: 0,
        user_id,
      });

      return {
        journal: { outcome: {}, targets: { user_id } },
        kind: "passkey_added",
      } as const;
    },
  );

export const userPasskeyRemoved = procedure
  .inputs(activityContextSchemas["user.passkey_removed"].shape.inputs)
  .private(z.object({ user_id: z.number() }))
  .outcome(activityContextSchemas["user.passkey_removed"].shape.outcome)
  .mutation(
    async ({
      actor,
      inputs: { credential_id, source },
      private: { user_id },
      tx,
    }) => {
      const deleted = await tx
        .delete(authenticators)
        .where(
          credential_id === null
            ? eq(authenticators.user_id, user_id)
            : and(
                eq(authenticators.user_id, user_id),
                eq(authenticators.credential_id, credential_id),
              ),
        )
        .returning({
          credential_id: authenticators.credential_id,
          display_name: authenticators.display_name,
        });

      if (deleted.length === 0) return { kind: "passkey_not_found" } as const;

      await liftForce2faIfNoSecondFactor({
        actor,
        reason: source === "self" ? "passkey_removed" : source,
        tx,
        user_id,
      });

      return {
        deleted,
        journal: { outcome: { removed: deleted.length }, targets: { user_id } },
        kind: "passkey_removed",
      } as const;
    },
  );

export const userRecoveryWordsRegenerated = procedure
  .inputs(
    activityContextSchemas["user.recovery_words_regenerated"].shape.inputs,
  )
  .private(z.object({ hashed_words: z.string(), user_id: z.number() }))
  .outcome(
    activityContextSchemas["user.recovery_words_regenerated"].shape.outcome,
  )
  .mutation(async ({ private: { hashed_words, user_id }, tx }) => {
    if (!(await is2faCapable(tx, user_id))) {
      return { kind: "not_2fa_capable" } as const;
    }

    const previous = await tx
      .delete(recovery_words)
      .where(eq(recovery_words.user_id, user_id))
      .returning({ user_id: recovery_words.user_id });
    await tx.insert(recovery_words).values({ hashed_words, user_id });

    return {
      journal: {
        outcome: {
          previous: { recovery_words_configured: previous.length > 0 },
        },
        targets: { user_id },
      },
      kind: "recovery_words_regenerated",
    } as const;
  });

export const userAccountRecovered = procedure
  .inputs(activityContextSchemas["user.account_recovered"].shape.inputs)
  .private(z.object({ recovery_words: z.string(), user_id: z.number() }))
  .outcome(activityContextSchemas["user.account_recovered"].shape.outcome)
  .mutation(
    async ({ actor, private: { recovery_words: words, user_id }, tx }) => {
      const [stored] = await tx
        .select({ hashed_words: recovery_words.hashed_words })
        .from(recovery_words)
        .where(eq(recovery_words.user_id, user_id))
        .for("update");

      if (!(await validatePassword(words, stored?.hashed_words ?? null))) {
        return { kind: "invalid_recovery_words" } as const;
      }

      const scope = createIdentiteRuntime({
        app: "proconnect-identite",
        db: tx,
        procedures: {
          user: {
            force_2fa_disabled: userForce2faDisabled,
            passkey_removed: userPasskeyRemoved,
            totp_removed: userTotpRemoved,
          },
        },
      }).as(actor);
      await scope.user.passkey_removed.mutate({
        credential_id: null,
        source: "account_recovery",
        user_id,
      });
      await scope.user.totp_removed.mutate({
        source: "account_recovery",
        user_id,
      });
      await tx
        .delete(recovery_words)
        .where(eq(recovery_words.user_id, user_id));

      return {
        journal: { outcome: {}, targets: { user_id } },
        kind: "account_recovered",
      } as const;
    },
  );
