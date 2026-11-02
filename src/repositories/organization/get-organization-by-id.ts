//

import { OrganizationNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { DatabaseContext } from "../database";
import { findOrganizationByIdFactory } from "./find-organization-by-id";

//

export function getOrganizationByIdFactory({ db }: DatabaseContext) {
  const findOrganizationById = findOrganizationByIdFactory({ db });

  return async function getOrganizationById(id: number) {
    const organization = await findOrganizationById(id);

    if (!organization) {
      throw new OrganizationNotFoundError(`Organization ${id} not found`);
    }

    return organization;
  };
}
