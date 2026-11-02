//

import { authenticators } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { Authenticator } from "@proconnect-gouv/proconnect.identite/types";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findAuthenticatorsByUserIdFactory({ db }: DatabaseContext) {
  return async function findAuthenticatorsByUserId(user_id: number) {
    const rows = await db
      .select()
      .from(authenticators)
      .where(eq(authenticators.user_id, user_id));

    return rows.map((row) => with_dates(row) as Authenticator);
  };
}
