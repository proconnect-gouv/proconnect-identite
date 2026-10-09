//

import type {
  Authenticator,
  BaseAuthenticator,
  DatabaseContext,
} from "#src/types";
import { type QueryResult } from "pg";

//

export function createAuthenticatorFactory({ pg }: DatabaseContext) {
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
    const { rows }: QueryResult<Authenticator> = await pg.query(
      `
        INSERT INTO authenticators
            (user_id,
             credential_id,
             credential_public_key,
             counter,
             credential_device_type,
             credential_backed_up,
             transports,
             display_name,
             created_at,
             last_used_at,
             usage_count,
             user_verified)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11)
        RETURNING *;`,
      [
        user_id,
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
      ],
    );

    return rows.shift()!;
  };
}
