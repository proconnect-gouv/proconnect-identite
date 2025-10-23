import type { Organization } from "#src/types";

const cat_jur = [
  "Établissement public local social et médico-social",
  "Syndicat intercommunal à vocation multiple (SIVOM)",
  "Syndicat intercommunal à vocation unique (SIVU)",
  "Syndicat mixte fermé",
];

export const isSyndicatCommunal = ({
  cached_libelle_categorie_juridique,
}: Pick<Organization, "cached_libelle_categorie_juridique">): boolean => {
  if (!cached_libelle_categorie_juridique) {
    return false;
  }
  return cat_jur.includes(cached_libelle_categorie_juridique);
};
