import { isDomainValid } from "@proconnect-gouv/proconnect.core/security";
import {
  isEntrepriseUnipersonnelle,
  isPublicService,
} from "@proconnect-gouv/proconnect.identite/services/organization";
import type { Organization } from "@proconnect-gouv/proconnect.identite/types";

export const isSmallAssociation = ({
  cached_libelle_categorie_juridique,
  cached_tranche_effectifs_unite_legale,
}: Organization): boolean => {
  // check that the organization has the right catégorie juridique
  const cat_jur_ok = ["Association déclarée"].includes(
    cached_libelle_categorie_juridique || "",
  );

  // check that the organization has the right tranche effectifs
  const tra_eff_ok = [null, "NN", "00", "01", "02", "03", "11", "12"].includes(
    cached_tranche_effectifs_unite_legale,
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
  cached_tranche_effectifs_unite_legale,
}: Organization): boolean => {
  return [null, "NN", "00", "01", "02", "03", "11", "12"].includes(
    cached_tranche_effectifs_unite_legale,
  );
};

export const isWasteManagementOrganization = ({
  cached_libelle_activite_principale,
}: Organization): boolean => {
  if (!cached_libelle_activite_principale) {
    return false;
  }

  return [
    "38.11Z - Collecte des déchets non dangereux",
    "38.12Z - Collecte des déchets dangereux",
    "38.21Z - Traitement et élimination des déchets non dangereux",
    "38.22Z - Traitement et élimination des déchets dangereux",
    "38.31Z - Démantèlement d’épaves",
    "38.32Z - Récupération de déchets triés",
    "39.00Z - Dépollution et autres services de gestion des déchets",
  ].includes(cached_libelle_activite_principale);
};

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

export const isEducationNationaleDomain = (domain: string) => {
  if (!isDomainValid(domain)) {
    return false;
  }

  return domain.match(/^ac-[a-zA-Z0-9-]*\.fr$/) !== null;
};

export const isArmeeDomain = (domain: string) => {
  if (!isDomainValid(domain)) {
    return false;
  }
  const ARMEE_DOMAINS = ["intradef.gouv.fr", "def.gouv.fr"];
  return ARMEE_DOMAINS.includes(domain);
};

export const getOrganizationTypeLabel = (organization: Organization) => {
  if (isEtablissementScolaireDuPremierEtSecondDegre(organization)) {
    return "établissement scolaire";
  } else {
    if (isCommune(organization)) {
      return "mairie";
    }

    if (isPublicService(organization)) {
      return "service";
    }
  }

  if (
    isEntrepriseUnipersonnelle(organization) &&
    isWasteManagementOrganization(organization)
  ) {
    return "entreprise";
  }

  return "organisation";
};
