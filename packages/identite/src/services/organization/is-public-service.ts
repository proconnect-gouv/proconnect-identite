//

import type { Organization } from "#src/types";
import {
  ADMINISTRATION_BLACKLIST,
  ADMINISTRATION_WHITELIST,
  ADMINISTRATIONS,
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
  if (ADMINISTRATION_BLACKLIST.includes(siren)) {
    return { isServicePublic: false };
  }

  // Closed entities are not considered public services
  if (cached_etat_administratif === "C") {
    return { isServicePublic: false };
  }

  // Check if entity is in whitelist (takes priority)
  if (ADMINISTRATION_WHITELIST.includes(siren)) {
    return { isServicePublic: true };
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

  return {
    isServicePublic: true,
    isAdministrationEtat,
    isCollectivite,
    isServicePublicAdministratif,
  };
};
