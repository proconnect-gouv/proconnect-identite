//

import { isOrganizationDirigeantFactory } from "@gouvfr-lasuite/proconnect.identite/managers/certification";
import { InseeApiRepository } from "../../connectors/api-insee";
import {
  EntrepriseApiInfogreffeRepository,
  EntrepriseApiInseeRepository,
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
