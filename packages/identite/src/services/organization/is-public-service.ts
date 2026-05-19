//

import type { Organization } from "#src/types";
import {
  ADMINISTRATION_ETAT_WHITELIST,
  ADMINISTRATIONS,
  NATURE_JURIDIQUE_SERVICE_PUBLIC,
  SERVICE_PUBLIC_BLACKLIST,
} from "@proconnect-gouv/proconnect.annuaire_entreprises";

export const computeIsServicePublic = ({
  cached_categorie_juridique,
  siret,
  cached_etat_administratif,
}: Pick<
  Organization,
  "cached_categorie_juridique" | "cached_etat_administratif" | "siret"
>): {
  isServicePublic: boolean;
  isAdministrationEtat?: boolean;
  isCollectivite?: boolean;
  isServicePublicAdministratif?: boolean;
} => {
  // Check if nature juridique is undefined/null
  if (!cached_categorie_juridique) {
    return { isServicePublic: false };
  }

  const siren = (siret || "").substring(0, 9);

  // Entities in the blacklist are never considered public services
  if (SERVICE_PUBLIC_BLACKLIST.includes(siren)) {
    return { isServicePublic: false };
  }

  // Closed entities are not considered public services
  if (cached_etat_administratif === "C") {
    return { isServicePublic: false };
  }

  // Check if entity is in whitelist (takes priority)
  if (ADMINISTRATION_ETAT_WHITELIST.includes(siren)) {
    return { isServicePublic: true, isAdministrationEtat: true };
  }

  const ADMINISTRATION = ADMINISTRATIONS.find(
    (ADMINISTRATION) =>
      cached_categorie_juridique === `${ADMINISTRATION.codeJuridique}`,
  );
  if (!ADMINISTRATION) {
    return { isServicePublic: false };
  }
  const { isAdministrationEtat, isCollectivite, isServicePublicAdministratif } =
    ADMINISTRATION;

  if (
    !isAdministrationEtat &&
    !isCollectivite &&
    !isServicePublicAdministratif
  ) {
    return { isServicePublic: false };
  }

  return {
    isServicePublic: true,
    isAdministrationEtat,
    isCollectivite,
    isServicePublicAdministratif,
  };
};

// inspired from https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/4ec29b1ef3370e0f840bd55dd6d38a4811faf18d/workflows/data_pipelines/elasticsearch/data_enrichment.py#L169-L209
export const isPublicService = ({
  cached_categorie_juridique,
  cached_etat_administratif,
  siret,
}: Pick<
  Organization,
  "cached_categorie_juridique" | "cached_etat_administratif" | "siret"
>): boolean => {
  // Check if nature juridique is undefined/null
  if (!cached_categorie_juridique) {
    return false;
  }

  const siren = (siret || "").substring(0, 9);

  // Entities in the blacklist are never considered public services
  if (SERVICE_PUBLIC_BLACKLIST.includes(siren)) {
    return false;
  }

  // Closed entities are not considered public services
  if (cached_etat_administratif === "C") {
    return false;
  }

  // Check if entity is in whitelist (takes priority)
  if (ADMINISTRATION_ETAT_WHITELIST.includes(siren)) {
    return true;
  }

  // Legal nature codes starting with 4 or 7 are public services
  if (
    cached_categorie_juridique.startsWith("4") ||
    cached_categorie_juridique.startsWith("7")
  ) {
    return true;
  }

  // Check if entity has a specific public service legal nature code
  return NATURE_JURIDIQUE_SERVICE_PUBLIC.includes(cached_categorie_juridique);
};
