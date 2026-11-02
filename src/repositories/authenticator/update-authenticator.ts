//

import { authenticators } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { Authenticator } from "@proconnect-gouv/proconnect.identite/types";
import type {
  Base64URLString,
  BaseAuthenticator,
} from "@proconnect-gouv/proconnect.identite/types";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function updateAuthenticatorFactory({ db }: DatabaseContext) {
  return async function updateAuthenticator(
    credential_id: Base64URLString,
    { counter, last_used_at, usage_count }: Partial<BaseAuthenticator>,
  ) {
    const [row] = await db
      .update(authenticators)
      .set({
        counter,
        last_used_at: last_used_at?.toISOString(),
        usage_count,
      })
      .where(eq(authenticators.credential_id, credential_id))
      .returning();

    if (!row) {
      throw new Error("Authenticator not found");
    }

    return with_dates(row) as Authenticator;
  };
}
