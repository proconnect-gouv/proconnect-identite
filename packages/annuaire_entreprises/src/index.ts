//

import administration_nature_juridique from "#data/administration_nature_juridique" with { type: "json" };
import administration_siren_blacklist from "#data/administration_siren_blacklist" with { type: "json" };
import administration_siren_whitelist from "#data/administration_siren_whitelist" with { type: "json" };

//

// Nature juridique codes for public services
// Source: https://raw.githubusercontent.com/annuaire-entreprises-data-gouv-fr/search-infra/f1e56ac476b0b1730115f7b1f0667e8509ee5379/helpers/labels/administration_nature_juridique.json (2025-09-30)
export const NATURE_JURIDIQUE_SERVICE_PUBLIC = Object.keys(
  administration_nature_juridique,
);

// SIREN blacklist - entities that are never considered public services
// Source: https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/f1e56ac476b0b1730115f7b1f0667e8509ee5379/helpers/labels/administration_siren_blacklist.json (2025-09-30)
export const SERVICE_PUBLIC_BLACKLIST = Object.keys(
  administration_siren_blacklist,
);

// SIREN whitelist for specific public services
// Source: https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/f1e56ac476b0b1730115f7b1f0667e8509ee5379/helpers/labels/administration_siren_whitelist.json (2025-09-30)
export const SERVICE_PUBLIC_WHITELIST = Object.keys(
  administration_siren_whitelist,
);
