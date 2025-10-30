//

import { isOrganizationDirigeantFactory } from "@proconnect-gouv/proconnect.identite/managers/certification";
import {
  ApiEntrepriseInfogreffeRepository,
  InseeApiRepository,
} from "../../connectors/api-sirene";
import { getFranceConnectUserInfo } from "../../repositories/user";

//

export const isOrganizationDirigeant = isOrganizationDirigeantFactory({
  ApiEntrepriseInfogreffeRepository,
  InseeApiRepository,
  getFranceConnectUserInfo,
});
