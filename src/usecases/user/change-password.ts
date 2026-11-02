//

import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  createIdentiteRuntime,
  type IdentiteDatabase,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { eq, sql } from "drizzle-orm";
import { with_dates } from "../../repositories/dates";

//

export async function changePassword({
  db,
  encrypted_password,
  user_id,
}: {
  db: IdentiteDatabase;
  encrypted_password: string;
  user_id: number;
}): Promise<User> {
  const runtime = createIdentiteRuntime({ app: "proconnect-identite", db });

  return db.transaction(async (tx) => {
    const [previous] = await tx
      .select({
        email_verified: users.email_verified,
        password_configured: sql<boolean>`${users.encrypted_password} is not null`,
      })
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
        encrypted_password,
        reset_password_sent_at: null,
        reset_password_token: null,
        updated_at: new Date().toISOString(),
      })
      .where(eq(users.id, user_id))
      .returning();

    await runtime.as({ type: "user", user_id }).record(tx, {
      action: "user.password_changed",
      context: {
        inputs: { source: "reset_password" },
        outcome: { previous },
      },
      user_id,
    });

    return with_dates(row);
  });
}
