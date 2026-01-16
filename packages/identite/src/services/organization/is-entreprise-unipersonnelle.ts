//

import type { Organization } from "#src/types";

/**
 * This function returns approximate results. As the data tranche effectifs is
 * two years old. Consequently, an organization that growths quickly within the
 * first two years of his existence can be miss-identified as unipersonnelle by
 * this function.
 */
export function isEntrepriseUnipersonnelle({
  cached_libelle_categorie_juridique,
  cached_tranche_effectifs_unite_legale,
}: Pick<
  Organization,
  "cached_libelle_categorie_juridique" | "cached_tranche_effectifs_unite_legale"
>): boolean {
  // check that the organization has the right catégorie juridique
  const cat_jur_ok = [
    "Entrepreneur individuel",
    "Société à responsabilité limitée (sans autre indication)",
    "SAS, société par actions simplifiée",
  ].includes(cached_libelle_categorie_juridique || "");

  // check that the organization has the right tranche effectifs
  const tra_eff_ok = [null, "NN", "00", "01"].includes(
    cached_tranche_effectifs_unite_legale,
  );

  return cat_jur_ok && tra_eff_ok;
}
