//

import { authenticators } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { and, eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";

//

export function deleteAuthenticatorFactory({ db }: DatabaseContext) {
  return async function deleteAuthenticator(
    user_id: number,
    credential_id: string,
  ) {
    const rows = await db
      .delete(authenticators)
      .where(
        and(
          eq(authenticators.user_id, user_id),
          eq(authenticators.credential_id, credential_id),
        ),
      )
      .returning({ credential_id: authenticators.credential_id });

    return rows.length > 0;
  };
}
