//

import { hashToPostgresParams } from "#src/services/postgres";
import type { DatabaseContext, FranceConnectUserInfo } from "#src/types";

//

export function upsertFranceconnectUserinfoFactory({ pg }: DatabaseContext) {
  return async function upsertFranceconnectUserinfo(
    value: Pick<FranceConnectUserInfo, "user_id"> &
      Partial<FranceConnectUserInfo>,
  ) {
    const fieldsWithTimestamps = {
      ...value,
      updated_at: new Date(),
    };

    const { paramsString, valuesString, values } =
      hashToPostgresParams<FranceConnectUserInfo>(fieldsWithTimestamps);

    const { rows } = await pg.query<FranceConnectUserInfo>(
      `
      INSERT INTO franceconnect_userinfo
        ${paramsString}
      VALUES
        ${valuesString}
      ON CONFLICT (user_id)
        DO UPDATE
          SET ${paramsString} = ${valuesString}
      RETURNING *
    `,
      [...values],
    );

    return rows.shift()!;
  };
}

export type UpsetFranceconnectUserinfoHandler = ReturnType<
  typeof upsertFranceconnectUserinfoFactory
>;
