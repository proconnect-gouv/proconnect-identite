//

import type { Organization } from "#src/types";

export const isEtablissementScolaireDuPremierEtSecondDegre = ({
  cached_libelle_activite_principale,
  cached_libelle_categorie_juridique,
}: Organization) => {
  const isCollegeOuLyceePublic =
    (cached_libelle_activite_principale ===
      "85.31Z - Enseignement secondaire général" ||
      cached_libelle_activite_principale ===
        "85.32Z - Enseignement secondaire technique ou professionnel") &&
    cached_libelle_categorie_juridique ===
      "Établissement public local d'enseignement";

  // Temporarily disabled because contact data from annuaire education nationale
  // are not accurate enough.
  // const isCollegeOuLyceePrive =
  //   (cached_libelle_activite_principale ===
  //     "85.31Z - Enseignement secondaire général" ||
  //     cached_libelle_activite_principale ===
  //       "85.32Z - Enseignement secondaire technique ou professionnel") &&
  //   cached_libelle_categorie_juridique === "Association déclarée";

  const isEcolePrimairePublique =
    cached_libelle_activite_principale === "85.20Z - Enseignement primaire" &&
    cached_libelle_categorie_juridique === "Commune et commune nouvelle";

  // Temporarily disabled because contact data from annuaire education nationale
  // are not accurate enough.
  // const isEcolePrimairePrivee =
  //   cached_libelle_activite_principale === "85.20Z - Enseignement primaire" &&
  //   cached_libelle_categorie_juridique === "Association déclarée";

  const isEcoleMaternellePublique =
    cached_libelle_activite_principale ===
      "85.10Z - Enseignement pré-primaire" &&
    cached_libelle_categorie_juridique === "Commune et commune nouvelle";

  return (
    isCollegeOuLyceePublic ||
    isEcolePrimairePublique ||
    isEcoleMaternellePublique
  );
};
