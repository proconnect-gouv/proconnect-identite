//

import type { DatabaseContext, RecoveryCode } from "#src/types";
import { type QueryResult } from "pg";

//

export function createRecoveryCodesFactory({ pg }: DatabaseContext) {
  return async function createRecoveryCodes({
    user_id,
    codes,
  }: {
    user_id: number;
    codes: string[];
  }) {
    const values: string[] = [];
    const params: any[] = [];

    codes.forEach((code, index) => {
      const offset = index * 2;
      values.push(`($${offset + 1}, $${offset + 2}, NOW())`);
      params.push(user_id, code);
    });

    const { rows }: QueryResult<RecoveryCode> = await pg.query(
      `
        INSERT INTO recovery_codes
            (user_id, code, created_at)
        VALUES
            ${values.join(", ")}
        RETURNING *;`,
      params,
    );

    return rows;
  };
}
