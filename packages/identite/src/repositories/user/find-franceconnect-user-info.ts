//

import type { DatabaseContext, FranceConnectUserInfo } from "#src/types";
import { type QueryResult } from "pg";

//

export function findFranceConnectUserInfoFactory({ pg }: DatabaseContext) {
  return async function findFranceConnectUserInfo(user_id: number) {
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
