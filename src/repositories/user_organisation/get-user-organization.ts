//

import { LinkNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { FindUserOrganizationLink } from "@proconnect-gouv/proconnect.identite/types";
import type { DatabaseContext } from "../database";
import { findUserOrganizationFactory } from "./find-user-organization.js";

//

export function getUserOrganizationFactory({ db }: DatabaseContext) {
  const findUserOrganization = findUserOrganizationFactory({ db });

  return async function getUserOrganization({
    organization_id,
    user_id,
  }: FindUserOrganizationLink) {
    const link = await findUserOrganization({ organization_id, user_id });
    if (!link) {
      throw new LinkNotFoundError("Link not found");
    }
    return link;
  };
}
