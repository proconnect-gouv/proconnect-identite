//

import {
  NATURE_JURIDIQUE_SERVICE_PUBLIC,
  SERVICE_PUBLIC_BLACKLIST,
  SERVICE_PUBLIC_WHITELIST,
} from "@proconnect-gouv/proconnect.annuaire_entreprises";
import type { Organization } from "@proconnect-gouv/proconnect.identite/types";

// inspired from https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/4ec29b1ef3370e0f840bd55dd6d38a4811faf18d/workflows/data_pipelines/elasticsearch/data_enrichment.py#L169-L209
export const isPublicService = ({
  cached_categorie_juridique,
  cached_etat_administratif,
  siret,
}: Organization): boolean => {
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
  if (SERVICE_PUBLIC_WHITELIST.includes(siren)) {
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
