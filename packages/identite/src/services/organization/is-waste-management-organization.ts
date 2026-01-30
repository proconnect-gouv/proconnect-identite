//

import type { Organization } from "#src/types";

//

const WASTE_MANAGEMENT_ACTIVITIES = [
  "38.11Z - Collecte des déchets non dangereux",
  "38.12Z - Collecte des déchets dangereux",
  "38.21Z - Traitement et élimination des déchets non dangereux",
  "38.22Z - Traitement et élimination des déchets dangereux",
  "38.31Z - Démantèlement d'épaves",
  "38.32Z - Récupération de déchets triés",
  "39.00Z - Dépollution et autres services de gestion des déchets",
];

export function isWasteManagementOrganization({
  cached_libelle_activite_principale,
}: Pick<Organization, "cached_libelle_activite_principale">): boolean {
  if (!cached_libelle_activite_principale) {
    return false;
  }

  return WASTE_MANAGEMENT_ACTIVITIES.includes(
    cached_libelle_activite_principale,
  );
}
