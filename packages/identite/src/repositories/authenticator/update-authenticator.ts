//

import type {
  Authenticator,
  BaseAuthenticator,
  DatabaseContext,
} from "#src/types";
import type { Base64URLString } from "@simplewebauthn/server";
import { type QueryResult } from "pg";

//

export function updateAuthenticatorFactory({ pg }: DatabaseContext) {
  return async function updateAuthenticator(
    credential_id: Base64URLString,
    { counter, last_used_at, usage_count }: Partial<BaseAuthenticator>,
  ) {
    const { rows }: QueryResult<Authenticator> = await pg.query(
      `
        UPDATE authenticators
        SET counter = $2, last_used_at = $3, usage_count = $4
        WHERE credential_id = $1
        RETURNING *`,
      [credential_id, counter, last_used_at, usage_count],
    );

    return rows.shift()!;
  };
}
