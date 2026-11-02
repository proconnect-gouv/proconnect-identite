//

import type { QueryResult } from "pg";
import type { DatabaseContext } from "../context";

//

export function deleteRecoveryWordsByUserIdFactory({ pg }: DatabaseContext) {
  return async function deleteRecoveryWordsByUserId(user_id: number) {
    const { rowCount, affectedRows } = (await pg.query(
      `
        DELETE FROM recovery_words
        WHERE user_id = $1
        RETURNING *`,

      [user_id],
    )) as QueryResult & { affectedRows?: number };
    return (affectedRows ?? rowCount ?? 0) > 0;
  };
}
