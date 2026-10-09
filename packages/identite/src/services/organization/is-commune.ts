//

import type { Organization } from "#src/types";

export const isCommune = (
  { cached_libelle_categorie_juridique }: Organization,
  considerCommunauteDeCommunesAsCommune = false,
): boolean => {
  let cat_jur = [
    "Commune et commune nouvelle",
    "Commune associée et commune déléguée",
  ];

  if (considerCommunauteDeCommunesAsCommune) {
    cat_jur.push("Communauté de communes");
  }

  return cat_jur.includes(cached_libelle_categorie_juridique || "");
};
