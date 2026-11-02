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

export async function addTotp({
  db,
  encrypted_totp_key,
  user_id,
}: {
  db: IdentiteDatabase;
  encrypted_totp_key: string;
  user_id: number;
}): Promise<User> {
  const runtime = createIdentiteRuntime({ app: "proconnect-identite", db });

  return db.transaction(async (tx) => {
    const [previous] = await tx
      .select({ encrypted_totp_key: users.encrypted_totp_key })
      .from(users)
      .where(eq(users.id, user_id))
      .for("update");

    if (!previous) {
      throw new UserNotFoundError("User not found");
    }

    const [row] = await tx
      .update(users)
      .set({
        encrypted_totp_key,
        totp_key_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .where(eq(users.id, user_id))
      .returning();

    await runtime.as({ type: "user", user_id }).record(tx, {
      action: "user.totp_added",
      context: {
        inputs: {},
        outcome: {
          previous: { totp_configured: previous.encrypted_totp_key !== null },
        },
      },
      user_id,
    });

    return with_dates(row);
  });
}
