//

import { authenticators } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type {
  Authenticator,
  BaseAuthenticator,
} from "@proconnect-gouv/proconnect.identite/types";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function createAuthenticatorFactory({ db }: DatabaseContext) {
  return async function createAuthenticator({
    user_id,
    authenticator: {
      credential_id,
      credential_public_key,
      counter,
      credential_device_type,
      credential_backed_up,
      transports,
      display_name,
      last_used_at,
      usage_count,
      user_verified,
    },
  }: {
    user_id: number;
    authenticator: BaseAuthenticator;
  }) {
    const [row] = await db
      .insert(authenticators)
      .values({
        counter,
        credential_backed_up,
        credential_device_type,
        credential_id,
        credential_public_key,
        display_name,
        last_used_at: last_used_at?.toISOString(),
        transports,
        usage_count,
        user_id,
        user_verified,
      })
      .returning();

    return with_dates(row) as Authenticator;
  };
}
