//

import type { Organization } from "#src/types";

export const isSmallOrganization = ({
  cached_libelle_categorie_juridique,
  cached_tranche_effectifs_unite_legale,
}: Organization): boolean => {
  const cat_jur_ok = [
    "Exploitation agricole à responsabilité limitée",
    "Groupement agricole d'exploitation en commun (GAEC)",
    "Groupement foncier agricole",
    "Société civile d'exploitation agricole",
    "Société civile immobilière",
  ].includes(cached_libelle_categorie_juridique || "");

  const tra_eff_ok = [null, "NN", "00", "01"].includes(
    cached_tranche_effectifs_unite_legale,
  );

  return cat_jur_ok && tra_eff_ok;
};
