//

import { isOrganizationDirigeantFactory } from "@proconnect-gouv/proconnect.identite/managers/certification";
import { RegistreNationalEntreprisesApiRepository } from "../../connectors/api-rne";
import {
  ApiEntrepriseInfogreffeRepository,
  InseeApiRepository,
} from "../../connectors/api-sirene";
import { getFranceConnectUserInfo } from "../../repositories/user";

//

export const isOrganizationDirigeant = isOrganizationDirigeantFactory({
  ApiEntrepriseInfogreffeRepository,
  FranceConnectApiRepository: { getFranceConnectUserInfo },
  InseeApiRepository,
  RegistreNationalEntreprisesApiRepository,
});
