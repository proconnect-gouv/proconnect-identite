//

import { moderations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findModerationByIdFactory({ db }: DatabaseContext) {
  return async function findModerationById(id: number) {
    const [row] = await db
      .select()
      .from(moderations)
      .where(eq(moderations.id, id));

    return row && with_dates(row);
  };
}
