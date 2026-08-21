//

import type { DatabaseContext } from "#src/types";
import type { QueryResult } from "pg";

//

export function deleteUserOrganizationFactory({ pg }: DatabaseContext) {
  return async function deleteUserOrganization({
    user_id,
    organization_id,
  }: {
    user_id: number;
    organization_id: number;
  }) {
    const { rowCount, affectedRows } = (await pg.query(
      `
DELETE FROM users_organizations
WHERE user_id = $1 AND organization_id = $2`,
      [user_id, organization_id],
    )) as QueryResult & { affectedRows?: number };

    return (affectedRows ?? rowCount ?? 0) > 0;
  };
}
