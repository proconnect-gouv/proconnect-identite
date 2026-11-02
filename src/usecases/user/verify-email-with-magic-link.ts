//

import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  createIdentiteRuntime,
  type IdentiteDatabase,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { eq } from "drizzle-orm";
import { with_dates } from "../../repositories/dates";

//

export async function verifyEmailWithMagicLink({
  db,
  user_id,
}: {
  db: IdentiteDatabase;
  user_id: number;
}): Promise<User> {
  const runtime = createIdentiteRuntime({ app: "proconnect-identite", db });

  return db.transaction(async (tx) => {
    const [previous] = await tx
      .select({ email_verified: users.email_verified })
      .from(users)
      .where(eq(users.id, user_id))
      .for("update");

    if (!previous) {
      throw new UserNotFoundError("User not found");
    }

    const [row] = await tx
      .update(users)
      .set({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        magic_link_sent_at: null,
        magic_link_token: null,
        updated_at: new Date().toISOString(),
      })
      .where(eq(users.id, user_id))
      .returning();

    if (!previous.email_verified) {
      await runtime.as({ type: "user", user_id }).record(tx, {
        action: "user.email_verified",
        context: {
          inputs: {},
          outcome: { previous: { email_verified: previous.email_verified } },
        },
        user_id,
      });
    }

    return with_dates(row);
  });
}
