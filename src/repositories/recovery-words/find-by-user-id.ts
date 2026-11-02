//

import { recovery_words } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findRecoveryWordsByUserIdFactory({ db }: DatabaseContext) {
  return async function findRecoveryWordsByUserId(user_id: number) {
    const [row] = await db
      .select()
      .from(recovery_words)
      .where(eq(recovery_words.user_id, user_id));

    return row && with_dates(row);
  };
}
