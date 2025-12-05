//

import { isOrganizationDirigeantFactory } from "@proconnect-gouv/proconnect.identite/managers/certification";
import { ApiEntrepriseInfogreffeRepository } from "../../connectors/api-entreprise";
import { InseeApiRepository } from "../../connectors/api-insee";
import { RegistreNationalEntreprisesApiRepository } from "../../connectors/api-rne";
import { getFranceConnectUserInfo } from "../../repositories/user";

//

export const performCertificationDirigeant = isOrganizationDirigeantFactory({
  ApiEntrepriseInfogreffeRepository,
  FranceConnectApiRepository: { getFranceConnectUserInfo },
  InseeApiRepository: { findBySiren: InseeApiRepository.findBySiren },
  RegistreNationalEntreprisesApiRepository,
});
