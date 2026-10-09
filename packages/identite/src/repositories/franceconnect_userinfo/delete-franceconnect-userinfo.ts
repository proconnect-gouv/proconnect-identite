//

import type { DatabaseContext } from "#src/types";

//

export function deleteFranceconnectUserinfoFactory({ pg }: DatabaseContext) {
  return async function deleteFranceconnectUserinfo(user_id: number) {
    return pg.query(
      `
      DELETE FROM franceconnect_userinfo
      WHERE user_id = $1
      `,
      [user_id],
    );
  };
}

export type DeleteFranceconnectUserinfoHandler = ReturnType<
  typeof deleteFranceconnectUserinfoFactory
>;
