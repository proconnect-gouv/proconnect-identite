//

import { recovery_words } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";

//

export function deleteRecoveryWordsByUserIdFactory({ db }: DatabaseContext) {
  return async function deleteRecoveryWordsByUserId(user_id: number) {
    const rows = await db
      .delete(recovery_words)
      .where(eq(recovery_words.user_id, user_id))
      .returning({ id: recovery_words.id });

    return rows.length > 0;
  };
}
