//

import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { type QueryResult } from "pg";
import type { DatabaseContext } from "../context";

//

export function findByResetPasswordTokenFactory({ pg }: DatabaseContext) {
  return async function findByResetPasswordToken(reset_password_token: string) {
    const { rows }: QueryResult<User> = await pg.query(
      `
SELECT *
FROM users WHERE reset_password_token = $1
`,
      [reset_password_token],
    );

    return rows.shift();
  };
}
