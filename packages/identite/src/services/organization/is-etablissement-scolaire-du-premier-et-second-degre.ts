//

import type { Organization } from "#src/types";

//

export function isEtablissementScolaireDuPremierEtSecondDegre({
  cached_libelle_activite_principale,
  cached_libelle_categorie_juridique,
}: Pick<
  Organization,
  "cached_libelle_activite_principale" | "cached_libelle_categorie_juridique"
>): boolean {
  const isCollegeOuLyceePublic =
    (cached_libelle_activite_principale ===
      "85.31Z - Enseignement secondaire général" ||
      cached_libelle_activite_principale ===
        "85.32Z - Enseignement secondaire technique ou professionnel") &&
    cached_libelle_categorie_juridique ===
      "Établissement public local d'enseignement";

  const isEcolePrimairePublique =
    cached_libelle_activite_principale === "85.20Z - Enseignement primaire" &&
    cached_libelle_categorie_juridique === "Commune et commune nouvelle";

  const isEcoleMaternellePublique =
    cached_libelle_activite_principale ===
      "85.10Z - Enseignement pré-primaire" &&
    cached_libelle_categorie_juridique === "Commune et commune nouvelle";

  return (
    isCollegeOuLyceePublic ||
    isEcolePrimairePublique ||
    isEcoleMaternellePublique
  );
}
