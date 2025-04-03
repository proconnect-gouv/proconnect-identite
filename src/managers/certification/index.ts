//

import { isOrganizationExecutiveFactory } from "@gouvfr-lasuite/proconnect.identite/managers/certification";
import {
  findBySiret,
  findMandatairesSociauxBySiren,
} from "../../connectors/api-sirene";
import { getFranceConnectUserInfo } from "../../repositories/user";
import { logger } from "../../services/log";

//

export const isOrganizationExecutive = isOrganizationExecutiveFactory({
  findBySiret,
  findMandatairesSociauxBySiren,
  getFranceConnectUserInfo,
  log: logger.info,
});
