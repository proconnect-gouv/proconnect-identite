//

import { recovery_words } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { RecoveryWords } from "@proconnect-gouv/proconnect.identite/types";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function createRecoveryWordsFactory({ db }: DatabaseContext) {
  return async function createRecoveryWords({
    user_id,
    hashed_words,
  }: {
    user_id: number;
    hashed_words: string;
  }) {
    const [row] = await db
      .insert(recovery_words)
      .values({ hashed_words, user_id })
      .returning();

    return with_dates(row) as RecoveryWords;
  };
}
