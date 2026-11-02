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

export async function setSignupPassword({
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
        email_verified: false,
        encrypted_password,
        updated_at: new Date().toISOString(),
      })
      .where(eq(users.id, user_id))
      .returning();

    await runtime.as({ type: "user", user_id }).record(tx, {
      action: "user.password_changed",
      context: { inputs: { source: "signup" }, outcome: { previous } },
      user_id,
    });

    return with_dates(row);
  });
}
