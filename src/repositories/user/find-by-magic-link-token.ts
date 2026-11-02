//

import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";

//

export function findByMagicLinkTokenFactory({ db }: DatabaseContext) {
  return async function findByMagicLinkToken(magic_link_token: string) {
    const row = await db.query.users.findFirst({
      where: eq(users.magic_link_token, magic_link_token),
    });

    return row && with_dates(row);
  };
}
