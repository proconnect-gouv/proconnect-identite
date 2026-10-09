//

import { type DatabaseContext, type Organization } from "#src/types";
import { OrganizationNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { findOrganizationByIdFactory } from "./find-organization-by-id.js";

//

export function getOrganizationByIdFactory({ pg }: DatabaseContext) {
  const findOrganizationById = findOrganizationByIdFactory({ pg });

  return async function getOrganizationById(id: number): Promise<Organization> {
    const organization = await findOrganizationById(id);
    if (!organization) {
      throw new OrganizationNotFoundError(`Organization ${id} not found`);
    }
    return organization;
  };
}
