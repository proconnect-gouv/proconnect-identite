//

import type { Organization } from "#src/types";

//

const COMMUNE_CATEGORIES = [
  "Commune et commune nouvelle",
  "Commune associée et commune déléguée",
];

export function isCommune(
  {
    cached_libelle_categorie_juridique,
  }: Pick<Organization, "cached_libelle_categorie_juridique">,
  considerCommunauteDeCommunesAsCommune = false,
): boolean {
  const categories = considerCommunauteDeCommunesAsCommune
    ? [...COMMUNE_CATEGORIES, "Communauté de communes"]
    : COMMUNE_CATEGORIES;

  return categories.includes(cached_libelle_categorie_juridique || "");
}
