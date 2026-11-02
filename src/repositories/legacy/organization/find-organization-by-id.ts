//

import type { Organization } from "@proconnect-gouv/proconnect.identite/types";
import type { QueryResult } from "pg";
import type { DatabaseContext } from "../context";

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
