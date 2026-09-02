//

import { getOrganizationInfoFactory } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { FEATURE_ENHANCE_ORGANIZATION_INFO_WITH_RNE_DATA } from "../config/env";
import { ApiEntrepriseClient } from "./api-entreprise";
import { ApiRegistreNationalEntreprisesClient } from "./api-rne";
//

export const getOrganizationInfo = getOrganizationInfoFactory(
  ApiEntrepriseClient,
  ApiRegistreNationalEntreprisesClient,
  {
    enhanceOrganizationInfoWithRneData:
      FEATURE_ENHANCE_ORGANIZATION_INFO_WITH_RNE_DATA,
  },
);
