//

import type { DatabaseContext } from "#src/types";

//

export function deleteAllRecoveryCodesByUserIdFactory({ pg }: DatabaseContext) {
  return async function deleteAllRecoveryCodesByUserId(user_id: number) {
    await pg.query(
      `
        DELETE FROM recovery_codes
        WHERE user_id = $1;`,
      [user_id],
    );
  };
}
