//

import {
  NATURE_JURIDIQUE_SERVICE_PUBLIC,
  SERVICE_PUBLIC_BLACKLIST,
  SERVICE_PUBLIC_WHITELIST,
} from "#src/data/organization";
import type { Organization } from "@gouvfr-lasuite/proconnect.identite/types";

// inspired from https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/f1e56ac476b0b1730115f7b1f0667e8509ee5379/workflows/data_pipelines/elasticsearch/data_enrichment.py#L155-L189
export const isPublicService = ({
  cached_categorie_juridique,
  cached_etat_administratif,
  siret,
}: Organization): boolean => {
  const siren = (siret || "").substring(0, 9);

  // Entities in the blacklist are never considered public services
  if (SERVICE_PUBLIC_BLACKLIST.includes(siren)) {
    return false;
  }

  // Closed entities are not considered public services
  if (cached_etat_administratif === "C") {
    return false;
  }

  // Check if entity is in whitelist or has a public service legal nature code
  const cat_jur_ok =
    cached_categorie_juridique &&
    NATURE_JURIDIQUE_SERVICE_PUBLIC.includes(cached_categorie_juridique);
  const whitelist_ok = SERVICE_PUBLIC_WHITELIST.includes(siren);

  return cat_jur_ok || whitelist_ok;
};
