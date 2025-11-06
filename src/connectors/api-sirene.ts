//

import { getOrganizationInfoFactory } from "@proconnect-gouv/proconnect.identite/managers/organization";
import { ApiEntrepriseInseeRepository } from "./api-entreprise";

//

export const getOrganizationInfo = getOrganizationInfoFactory({
  findBySiren: ApiEntrepriseInseeRepository.findBySiren,
  findBySiret: ApiEntrepriseInseeRepository.findBySiret,
});
