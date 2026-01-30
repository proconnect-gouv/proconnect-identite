//

import {
  isCommune,
  isEntrepriseUnipersonnelle,
  isEtablissementScolaireDuPremierEtSecondDegre,
  isPublicService,
  isWasteManagementOrganization,
} from "@proconnect-gouv/proconnect.identite/services/organization";
import type { Organization } from "@proconnect-gouv/proconnect.identite/types";

//

// Re-export migrated functions for backwards compatibility
export {
  hasLessThanFiftyEmployees,
  isArmeeDomain,
  isCommune,
  isEducationNationaleDomain,
  isEtablissementScolaireDuPremierEtSecondDegre,
  isWasteManagementOrganization,
} from "@proconnect-gouv/proconnect.identite/services/organization";

//

export function getOrganizationTypeLabel(organization: Organization): string {
  if (isEtablissementScolaireDuPremierEtSecondDegre(organization)) {
    return "établissement scolaire";
  } else {
    if (isCommune(organization)) {
      return "mairie";
    }

    if (isPublicService(organization)) {
      return "service";
    }
  }

  if (
    isEntrepriseUnipersonnelle(organization) &&
    isWasteManagementOrganization(organization)
  ) {
    return "entreprise";
  }

  return "organisation";
}
