//

import { moderations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";

//

export function deleteModerationFactory({ db }: DatabaseContext) {
  return async function deleteModeration(id: number) {
    const rows = await db
      .delete(moderations)
      .where(eq(moderations.id, id))
      .returning({ id: moderations.id });

    return rows.length > 0;
  };
}
