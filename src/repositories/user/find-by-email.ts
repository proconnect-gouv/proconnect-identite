//

import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";

//

export function findByEmailFactory({ db }: DatabaseContext) {
  return async function findByEmail(email: string) {
    const row = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return row && with_dates(row);
  };
}

