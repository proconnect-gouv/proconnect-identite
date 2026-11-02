//

import { franceconnect_userinfo } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { FranceConnectUserInfo } from "@proconnect-gouv/proconnect.identite/types";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export function findFranceconnectUserinfoFactory({ db }: DatabaseContext) {
  return async function findFranceconnectUserinfo(user_id: number) {
    const [row] = await db
      .select()
      .from(franceconnect_userinfo)
      .where(eq(franceconnect_userinfo.user_id, user_id))
      .limit(1);

    // rows are written from FranceConnectUserInfoResponseSchema, so every claim is present
    return row && (with_dates(row) as FranceConnectUserInfo);
  };
}
