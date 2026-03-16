//

import { getOrganizationInfoFactory } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { ApiEntrepriseInseeClient } from "./api-entreprise";

//

export const getOrganizationInfo = getOrganizationInfoFactory(
  ApiEntrepriseInseeClient,
);
