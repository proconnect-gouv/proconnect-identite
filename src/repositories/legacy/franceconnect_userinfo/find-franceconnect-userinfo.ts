//

import type { FranceConnectUserInfo } from "@proconnect-gouv/proconnect.identite/types";
import { type QueryResult } from "pg";
import type { DatabaseContext } from "../context";

//

export function findFranceconnectUserinfoFactory({ pg }: DatabaseContext) {
  return async function findFranceconnectUserinfo(user_id: number) {
    const { rows }: QueryResult<FranceConnectUserInfo> = await pg.query(
      `
      SELECT *
      FROM franceconnect_userinfo
      WHERE user_id = $1
      `,
      [user_id],
    );

    return rows.shift();
  };
}
