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

export async function enableForce2fa({
  db,
  user_id,
}: {
  db: IdentiteDatabase;
  user_id: number;
}): Promise<User> {
  const runtime = createIdentiteRuntime({ app: "proconnect-identite", db });

  return db.transaction(async (tx) => {
    const [previous] = await tx
      .select({ force_2fa: users.force_2fa })
      .from(users)
      .where(eq(users.id, user_id))
      .for("update");

    if (!previous) {
      throw new UserNotFoundError("User not found");
    }

    if (previous.force_2fa) {
      const [current] = await tx
        .select()
        .from(users)
        .where(eq(users.id, user_id));
      return with_dates(current);
    }

    const [row] = await tx
      .update(users)
      .set({ force_2fa: true, updated_at: new Date().toISOString() })
      .where(eq(users.id, user_id))
      .returning();

    await runtime.as({ type: "user", user_id }).record(tx, {
      action: "user.force_2fa_enabled",
      context: {
        inputs: {},
        outcome: { previous: { force_2fa: previous.force_2fa } },
      },
      user_id,
    });

    return with_dates(row);
  });
}
