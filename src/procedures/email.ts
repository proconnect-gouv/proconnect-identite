import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  activityContextSchemas,
  procedure,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
  VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
} from "../config/env";
import { isExpired } from "../services/is-expired";

const { inputs, outcome } = activityContextSchemas["user.email_verified"].shape;

export const userEmailVerified = procedure
  .inputs(inputs)
  .private(z.object({ token: z.string(), user_id: z.number() }))
  .outcome(outcome)
  .mutation(async ({ inputs: { source }, private: { token, user_id }, tx }) => {
    const [user] = await tx
      .select({
        email_verified: users.email_verified,
        magic_link_sent_at: users.magic_link_sent_at,
        magic_link_token: users.magic_link_token,
        verify_email_sent_at: users.verify_email_sent_at,
        verify_email_token: users.verify_email_token,
      })
      .from(users)
      .where(eq(users.id, user_id))
      .for("update");

    if (!user) {
      throw new UserNotFoundError(`user ${user_id} not found`);
    }

    if (source === "verify_email") {
      if (user.verify_email_token !== token) {
        return { kind: "invalid_token" } as const;
      }

      if (
        isExpired(
          user.verify_email_sent_at,
          VERIFY_EMAIL_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
        )
      ) {
        return { kind: "token_expired" } as const;
      }
    } else if (user.magic_link_token !== token) {
      return { kind: "invalid_token" } as const;
    } else if (
      isExpired(
        user.magic_link_sent_at,
        MAGIC_LINK_TOKEN_EXPIRATION_DURATION_IN_MINUTES,
      )
    ) {
      return { kind: "token_expired" } as const;
    }

    const tokensToClear =
      source === "verify_email"
        ? { verify_email_sent_at: null, verify_email_token: null }
        : { magic_link_sent_at: null, magic_link_token: null };

    const [updatedUser] = await tx
      .update(users)
      .set({
        email_verified: true,
        email_verified_at: sql`now()`,
        ...tokensToClear,
        updated_at: sql`now()`,
      })
      .where(eq(users.id, user_id))
      .returning();

    const previous = { email_verified: user.email_verified };

    if (previous.email_verified === false || source === "verify_email") {
      return {
        journal: { outcome: { previous }, targets: { user_id } },
        kind: "email_verified",
        user: updatedUser,
      } as const;
    }

    return { kind: "email_verified", user: updatedUser } as const;
  });
