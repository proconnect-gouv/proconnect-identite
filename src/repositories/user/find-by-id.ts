//

import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";

//

export function findByIdFactory({ db }: DatabaseContext) {
  return async function findById(id: number) {
    const row = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    return row && with_dates(row);
  };
}

