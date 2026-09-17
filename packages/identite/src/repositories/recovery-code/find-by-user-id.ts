//

import type { DatabaseContext, RecoveryCode } from "#src/types";
import { type QueryResult } from "pg";

//

export function findRecoveryCodesByUserIdFactory({ pg }: DatabaseContext) {
  return async function findRecoveryCodesByUserId(user_id: number) {
    const { rows }: QueryResult<RecoveryCode> = await pg.query(
      `
        SELECT *
        FROM recovery_codes
        WHERE user_id = $1
    `,
      [user_id],
    );

    return rows;
  };
}
