//

import { LinkNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import type { FindUserOrganizationLink } from "@proconnect-gouv/proconnect.identite/types";
import { isEmpty } from "lodash-es";
import type { DatabaseContext } from "../context";
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
