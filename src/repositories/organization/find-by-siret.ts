//

import { organizations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { IdentiteDatabase } from "@proconnect-gouv/proconnect.identite.runtime";
import { eq } from "drizzle-orm";
import { organizationColumns } from "./organization-columns";

//

export async function findOrganizationBySiret(
  db: IdentiteDatabase,
  siret: string,
) {
  const [organization] = await db
    .select(organizationColumns)
    .from(organizations)
    .where(eq(organizations.siret, siret))
    .limit(1);

  return organization;
}
