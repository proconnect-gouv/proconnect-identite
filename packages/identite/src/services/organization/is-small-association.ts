//

import type { Organization } from "#src/types";

export function isSmallAssociation({
  cached_libelle_categorie_juridique,
  cached_tranche_effectifs,
}: Pick<
  Organization,
  "cached_libelle_categorie_juridique" | "cached_tranche_effectifs"
>): boolean {
  // check that the organization has the right catégorie juridique
  const cat_jur_ok = ["Association déclarée"].includes(
    cached_libelle_categorie_juridique || "",
  );

  // check that the organization has the right tranche effectifs
  const tra_eff_ok = [null, "NN", "00", "01", "02", "03", "11", "12"].includes(
    cached_tranche_effectifs,
  );

  return cat_jur_ok && tra_eff_ok;
}
