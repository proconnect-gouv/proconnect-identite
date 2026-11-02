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

export async function updatePersonalInformations({
  db,
  information,
  user_id,
}: {
  db: IdentiteDatabase;
  information: Partial<
    Pick<User, "family_name" | "given_name" | "job" | "phone_number">
  >;
  user_id: number;
}): Promise<User> {
  const runtime = createIdentiteRuntime({ app: "proconnect-identite", db });

  return db.transaction(async (tx) => {
    const [previous] = await tx
      .select({
        family_name: users.family_name,
        given_name: users.given_name,
        job: users.job,
        phone_number: users.phone_number,
      })
      .from(users)
      .where(eq(users.id, user_id))
      .for("update");

    if (!previous) {
      throw new UserNotFoundError("User not found");
    }

    const next = {
      family_name:
        information.family_name !== undefined
          ? information.family_name
          : previous.family_name,
      given_name:
        information.given_name !== undefined
          ? information.given_name
          : previous.given_name,
      job: information.job !== undefined ? information.job : previous.job,
      phone_number:
        information.phone_number !== undefined
          ? information.phone_number
          : previous.phone_number,
    };

    if (
      next.family_name === previous.family_name &&
      next.given_name === previous.given_name &&
      next.job === previous.job &&
      next.phone_number === previous.phone_number
    ) {
      const [current] = await tx
        .select()
        .from(users)
        .where(eq(users.id, user_id));
      return with_dates(current);
    }

    const [row] = await tx
      .update(users)
      .set({ ...next, updated_at: new Date().toISOString() })
      .where(eq(users.id, user_id))
      .returning();

    await runtime.as({ type: "user", user_id }).record(tx, {
      action: "user.info_changed",
      context: { inputs: next, outcome: { previous } },
      user_id,
    });

    return with_dates(row);
  });
}
