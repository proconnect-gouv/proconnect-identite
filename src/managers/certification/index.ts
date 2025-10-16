//

import { isOrganizationDirigeantFactory } from "@proconnect-gouv/proconnect.identite/managers/certification";
import {
  ApiEntrepriseInfogreffeRepository,
  ApiEntrepriseInseeRepository,
  InseeApiRepository,
} from "../../connectors/api-sirene";
import { getFranceConnectUserInfo } from "../../repositories/user";
import { logger } from "../../services/log";

//

export const isOrganizationDirigeant = isOrganizationDirigeantFactory({
  ApiEntrepriseInfogreffeRepository,
  ApiEntrepriseInseeRepository,
  InseeApiRepository,
  getFranceConnectUserInfo,
  log: logger.info,
});
