//

import { hashToPostgresParams } from "#src/services/postgres";
import type {
  DatabaseContext,
  FindUserOrganizationLink,
  User,
  UserOrganizationLink,
} from "#src/types";
import type { QueryResult } from "pg";

//

export function updateUserOrganizationFactory({ pg }: DatabaseContext) {
  return async function updateUserOrganization(
    { organization_id, user_id }: FindUserOrganizationLink,
    fieldsToUpdate: Partial<UserOrganizationLink>,
  ) {
    const connection = pg;

    const fieldsToUpdateWithTimestamps = {
      ...fieldsToUpdate,
      updated_at: new Date(),
    };

    const { paramsString, valuesString, values } = hashToPostgresParams<User>(
      fieldsToUpdateWithTimestamps,
    );

    const { rows }: QueryResult<UserOrganizationLink> = await connection.query(
      `
      UPDATE users_organizations SET ${paramsString} = ${valuesString}
      WHERE organization_id = $${values.length + 1}
      AND user_id = $${values.length + 2}
      RETURNING *
      `,
      [...values, organization_id, user_id],
    );

    return rows.shift()!;
  };
}
