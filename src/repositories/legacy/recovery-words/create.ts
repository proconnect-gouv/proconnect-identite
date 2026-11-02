//

import type { RecoveryWords } from "@proconnect-gouv/proconnect.identite/types";
import { type QueryResult } from "pg";
import type { DatabaseContext } from "../context";

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
