//

import type { DatabaseContext, FranceConnectUserInfo } from "#src/types";
import { type QueryResult } from "pg";

//

export function getFranceConnectUserInfoFactory({ pg }: DatabaseContext) {
  return async function getFranceConnectUserInfo(user_id: number) {
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

export type GetFranceConnectUserInfoHandler = ReturnType<
  typeof getFranceConnectUserInfoFactory
>;
