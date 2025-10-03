//

import { isOrganizationDirigeantFactory } from "@proconnect-gouv/proconnect.identite/managers/certification";
import {
  EntrepriseApiInfogreffeRepository,
  EntrepriseApiInseeRepository,
  InseeApiRepository,
} from "../../connectors/api-sirene";
import { getFranceConnectUserInfo } from "../../repositories/user";
import { logger } from "../../services/log";

//

export const isOrganizationDirigeant = isOrganizationDirigeantFactory({
  EntrepriseApiInfogreffeRepository,
  EntrepriseApiInseeRepository,
  InseeApiRepository,
  getFranceConnectUserInfo,
  log: logger.info,
});
