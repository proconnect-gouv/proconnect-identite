//

import { hashToPostgresParams } from "#src/services";
import type { DatabaseContext, User, UserOrganizationLink } from "#src/types";
import type { QueryResult } from "pg";

//

export function updateUserOrganizationLinkFactory({ pg }: DatabaseContext) {
  return async function updateUserOrganizationLink(
    organization_id: number,
    user_id: number,
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

export type UpdateUserOrganizationLinkHandler = ReturnType<
  typeof updateUserOrganizationLinkFactory
>;
