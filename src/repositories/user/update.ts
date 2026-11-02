//

import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function updateUserFactory({ db }: DatabaseContext) {
  return async function updateUser(id: number, fieldsToUpdate: Partial<User>) {
    // the field map is dynamic; dates cross the driver as ISO strings
    const values = Object.fromEntries(
      Object.entries(fieldsToUpdate).map(([key, value]) => [
        key,
        value instanceof Date ? value.toISOString() : value,
      ]),
    ) as Partial<typeof users.$inferInsert>;

    const [row] = await db
      .update(users)
      .set({ ...values, updated_at: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();

    if (!row) {
      throw new UserNotFoundError("User not found");
    }

    return with_dates(row);
  };
}
