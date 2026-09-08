//

import type { DatabaseContext } from "#src/types";

//

export function deleteFranceConnectUserInfoFactory({ pg }: DatabaseContext) {
  return async function deleteFranceConnectUserInfo(user_id: number) {
    return pg.query(
      `
      DELETE FROM franceconnect_userinfo
      WHERE user_id = $1
      `,
      [user_id],
    );
  };
}

export type DeleteFranceConnectUserInfoHandler = ReturnType<
  typeof deleteFranceConnectUserInfoFactory
>;
