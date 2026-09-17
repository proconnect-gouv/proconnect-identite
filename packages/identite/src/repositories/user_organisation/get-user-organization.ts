//

import { LinkNotFoundError } from "#src/errors";
import type { DatabaseContext, FindUserOrganizationLink } from "#src/types";
import { isEmpty } from "lodash-es";
import { findUserOrganizationFactory } from "./find-user-organization.js";

//

export function getUserOrganizationFactory({ pg }: DatabaseContext) {
  const findUserOrganization = findUserOrganizationFactory({ pg });
  return async function getUserOrganization({
    organization_id,
    user_id,
  }: FindUserOrganizationLink) {
    const link = await findUserOrganization({ organization_id, user_id });
    if (isEmpty(link)) {
      throw new LinkNotFoundError("Link not found");
    }
    return link;
  };
}
