//

import { getOrganizationInfoFactory } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { ApiEntrepriseClient } from "./api-entreprise";

//

export const getOrganizationInfo =
  getOrganizationInfoFactory(ApiEntrepriseClient);
