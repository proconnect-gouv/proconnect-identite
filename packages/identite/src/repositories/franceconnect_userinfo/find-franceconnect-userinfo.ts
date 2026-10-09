//

import type { DatabaseContext, FranceConnectUserInfo } from "#src/types";
import { type QueryResult } from "pg";

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
