//

import type { DatabaseContext, RecoveryWords } from "#src/types";
import { type QueryResult } from "pg";

//

export function createRecoveryWordsFactory({ pg }: DatabaseContext) {
  return async function createRecoveryWords({
    user_id,
    hashed_words,
  }: {
    user_id: number;
    hashed_words: string;
  }) {
    const { rows }: QueryResult<RecoveryWords> = await pg.query(
      `
        INSERT INTO recovery_words
            (user_id, hashed_words)
        VALUES
            ($1, $2)
        RETURNING *;`,
      [user_id, hashed_words],
    );

    return rows.shift()!;
  };
}
