//

import type { Organization } from "#src/types";

export const isWasteManagementOrganization = ({
  cached_libelle_activite_principale,
}: Organization): boolean => {
  if (!cached_libelle_activite_principale) {
    return false;
  }

  return [
    "38.11Z - Collecte des déchets non dangereux",
    "38.12Z - Collecte des déchets dangereux",
    "38.21Z - Traitement et élimination des déchets non dangereux",
    "38.22Z - Traitement et élimination des déchets dangereux",
    "38.31Z - Démantèlement d’épaves",
    "38.32Z - Récupération de déchets triés",
    "39.00Z - Dépollution et autres services de gestion des déchets",
  ].includes(cached_libelle_activite_principale);
};
