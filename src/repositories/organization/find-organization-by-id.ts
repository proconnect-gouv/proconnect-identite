//

import { organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { to_organization } from "./to-organization.js";

//

export function findOrganizationByIdFactory({ db }: DatabaseContext) {
  return async function findOrganizationById(id: number) {
    const [row] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));

    return row && to_organization(row);
  };
}
