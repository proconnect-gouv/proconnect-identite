//

import type { Organization } from "#src/types";
import { isCommune } from "./is-commune.js";
import { isEntrepriseUnipersonnelle } from "./is-entreprise-unipersonnelle.js";
import { isEtablissementScolaireDuPremierEtSecondDegre } from "./is-etablissement-scolaire-du-premier-et-second-degre.js";
import { isPublicService } from "./is-public-service.js";
import { isWasteManagementOrganization } from "./is-waste-management-organization.js";

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
