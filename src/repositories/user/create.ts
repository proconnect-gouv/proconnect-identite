//

import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function createUserFactory({ db }: DatabaseContext) {
  return async function createUser({
    email,
    encrypted_password = null,
  }: {
    email: string;
    encrypted_password?: string | null;
  }) {
    const now = new Date().toISOString();
    const [row] = await db
      .insert(users)
      .values({
        created_at: now,
        email,
        email_verified: false,
        encrypted_password,
        sign_in_count: 0,
        updated_at: now,
      })
      .returning();

    return with_dates(row);
  };
}
