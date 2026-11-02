//

import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { type QueryResult } from "pg";
import type { DatabaseContext } from "../context";

//

export function findByMagicLinkTokenFactory({ pg }: DatabaseContext) {
  return async function findByMagicLinkToken(magic_link_token: string) {
    const { rows }: QueryResult<User> = await pg.query(
      `
SELECT *
FROM users WHERE magic_link_token = $1
`,
      [magic_link_token],
    );

    return rows.shift();
  };
}
