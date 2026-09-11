//

import type { DatabaseContext, Organization } from "#src/types";
import type { QueryResult } from "pg";

//

export function findOrganizationByIdFactory({ pg }: DatabaseContext) {
  return async function findOrganizationById(id: number) {
    const { rows }: QueryResult<Organization> = await pg.query(
      `
      SELECT *
      FROM organizations
      WHERE id = $1`,
      [id],
    );

    return rows.shift();
  };
}

export type FindByIdHandler = ReturnType<typeof findOrganizationByIdFactory>;
