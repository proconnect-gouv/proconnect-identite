//

import { authenticators } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { Authenticator } from "@proconnect-gouv/proconnect.identite/types";
import { and, eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findAuthenticatorFactory({ db }: DatabaseContext) {
  return async function findAuthenticator(
    user_id: number,
    serialized_credential_id: string,
  ) {
    const [row] = await db
      .select()
      .from(authenticators)
      .where(
        and(
          eq(authenticators.user_id, user_id),
          eq(authenticators.credential_id, serialized_credential_id),
        ),
      )
      .limit(1);

    // rows are written from verified WebAuthn registrations; the columns hold the domain values
    return row && (with_dates(row) as Authenticator);
  };
}
