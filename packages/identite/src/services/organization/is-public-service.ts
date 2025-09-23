//

import type { Organization } from "@gouvfr-lasuite/proconnect.identite/types";

// inspired from https://github.com/etalab/annuaire-entreprises-search-infra/blob/c86bdb34ff6359de3a740ae2f1fa49133ddea362/data_enrichment.py#L104
export const isPublicService = ({
  cached_categorie_juridique,
  siret,
}: Organization): boolean => {
  const cat_jur_ok = ["4", "71", "72", "73", "74"].some((e) =>
    cached_categorie_juridique?.startsWith(e),
  );

  const siren = (siret || "").substring(0, 9);
  const whitelist_ok = ["320252489", "777749326"].includes(siren);

  return cat_jur_ok || whitelist_ok;
};