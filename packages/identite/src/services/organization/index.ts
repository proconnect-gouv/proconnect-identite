//

import type { Organization } from "#src/types";

export * from "./is-domain-allowed-for-organization.js";
export * from "./is-entreprise-unipersonnelle.js";
export * from "./is-public-service.js";

export const isSmallAssociation = ({
  cached_libelle_categorie_juridique,
  cached_tranche_effectifs,
}: Organization): boolean => {
  // check that the organization has the right catégorie juridique
  const cat_jur_ok = ["Association déclarée"].includes(
    cached_libelle_categorie_juridique || "",
  );

  // check that the organization has the right tranche effectifs
  const tra_eff_ok = [null, "NN", "00", "01", "02", "03", "11", "12"].includes(
    cached_tranche_effectifs,
  );

  return cat_jur_ok && tra_eff_ok;
};

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

export const hasLessThanFiftyEmployees = ({
  cached_tranche_effectifs,
}: Organization): boolean => {
  return [null, "NN", "00", "01", "02", "03", "11", "12"].includes(
    cached_tranche_effectifs,
  );
};

export class UserMustConfirmToJoinOrganizationError extends Error {
  constructor(
    public organizationId: number,
    options?: ErrorOptions,
  ) {
    super(`Organization ${organizationId} confirmation is required`, options);
    this.name = "UserMustConfirmToJoinOrganizationError";
  }
}

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
