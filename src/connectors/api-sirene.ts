//

import { getOrganizationInfoFactory } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { ApiEntrepriseClient } from "./api-entreprise";
import { ApiRegistreNationalEntreprisesClient } from "./api-rne";

//

export const getOrganizationInfo = getOrganizationInfoFactory(
  ApiEntrepriseClient,
  ApiRegistreNationalEntreprisesClient,
);
