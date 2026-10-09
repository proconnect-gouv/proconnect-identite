//

import type { Organization } from "#src/types";
import { computeServicePublicInfo } from "./compute-service-public-info.js";
import { isCommune } from "./is-commune.js";
import { isEntrepriseUnipersonnelle } from "./is-entreprise-unipersonnelle.js";
import { isEtablissementScolaireDuPremierEtSecondDegre } from "./is-etablissement-scolaire-du-premier-et-second-degre.js";
import { isWasteManagementOrganization } from "./is-waste-management-organization.js";

export const getOrganizationTypeLabel = (organization: Organization) => {
  if (isEtablissementScolaireDuPremierEtSecondDegre(organization)) {
    return "établissement scolaire";
  } else {
    if (isCommune(organization)) {
      return "mairie";
    }

    if (computeServicePublicInfo(organization).isServicePublic) {
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
};
