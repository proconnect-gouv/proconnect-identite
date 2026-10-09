//

import type { Organization } from "#src/types";

export const isSmallAssociation = ({
  cached_libelle_categorie_juridique,
  cached_tranche_effectifs_unite_legale,
}: Organization): boolean => {
  // check that the organization has the right catégorie juridique
  const cat_jur_ok = [
    "Association non déclarée",
    "Association déclarée",
    "Association déclarée d'insertion par l'économique",
    "Association intermédiaire",
    "Groupement d'employeurs",
    "Association d'avocats à responsabilité professionnelle individuelle",
    "Association déclarée, reconnue d'utilité publique",
    "Congrégation",
    "Association de droit local (Bas-Rhin, Haut-Rhin et Moselle)",
  ].includes(cached_libelle_categorie_juridique || "");

  // check that the organization has the right tranche effectifs
  const tra_eff_ok = [null, "NN", "00", "01", "02", "03", "11", "12"].includes(
    cached_tranche_effectifs_unite_legale,
  );

  return cat_jur_ok && tra_eff_ok;
};
