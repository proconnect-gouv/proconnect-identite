//

import type { Authenticator } from "@proconnect-gouv/proconnect.identite/types";
import { type QueryResult } from "pg";
import type { DatabaseContext } from "../context";

//

export function findAuthenticatorsByUserIdFactory({ pg }: DatabaseContext) {
  return async function findAuthenticatorsByUserId(user_id: number) {
    const { rows }: QueryResult<Authenticator> = await pg.query(
      `
        SELECT *
        FROM authenticators
        WHERE user_id = $1
    `,
      [user_id],
    );

    return rows;
  };
}
