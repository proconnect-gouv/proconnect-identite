//

import { hashToPostgresParams } from "@proconnect-gouv/proconnect.identite/services/postgres";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import type { QueryResult } from "pg";
import type { DatabaseContext } from "../context";

//

export function updateUserFactory({ pg }: DatabaseContext) {
  return async function updateUser(id: number, fieldsToUpdate: Partial<User>) {
    const fieldsToUpdateWithTimestamps = {
      ...fieldsToUpdate,
      updated_at: new Date(),
    };

    const { paramsString, valuesString, values } = hashToPostgresParams<User>(
      fieldsToUpdateWithTimestamps,
    );

    const { rows }: QueryResult<User> = await pg.query(
      `
      UPDATE users
      SET ${paramsString} = ${valuesString}
      WHERE id = $${values.length + 1}
      RETURNING *
      `,
      [...values, id],
    );

    return rows.shift()!;
  };
}

export type UpdateUserHandler = ReturnType<typeof updateUserFactory>;
