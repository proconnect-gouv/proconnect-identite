//

import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";

//

export function findByResetPasswordTokenFactory({ db }: DatabaseContext) {
  return async function findByResetPasswordToken(reset_password_token: string) {
    const row = await db.query.users.findFirst({
      where: eq(users.reset_password_token, reset_password_token),
    });

    return row && with_dates(row);
  };
}
