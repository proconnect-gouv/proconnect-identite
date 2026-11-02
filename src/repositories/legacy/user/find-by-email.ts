//

import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { type QueryResult } from "pg";
import type { DatabaseContext } from "../context";

//

export function findByEmailFactory({ pg }: DatabaseContext) {
  return async function findByEmail(email: string) {
    const { rows }: QueryResult<User> = await pg.query(
      `
      SELECT *
      FROM users WHERE email = $1
      `,
      [email],
    );

    return rows.shift();
  };
}

export type FindByEmailHandler = ReturnType<typeof findByEmailFactory>;
