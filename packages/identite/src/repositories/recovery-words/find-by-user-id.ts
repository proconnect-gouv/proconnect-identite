//

import type { DatabaseContext, RecoveryWords } from "#src/types";
import { type QueryResult } from "pg";

//

export function findRecoveryWordsByUserIdFactory({ pg }: DatabaseContext) {
  return async function findRecoveryWordsByUserId(user_id: number) {
    const { rows }: QueryResult<RecoveryWords> = await pg.query(
      `
        SELECT *
        FROM recovery_words
        WHERE user_id = $1;`,
      [user_id],
    );

    return rows.shift();
  };
}
