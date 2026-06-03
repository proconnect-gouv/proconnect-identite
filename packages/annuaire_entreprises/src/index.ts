//

import administrations from "#data/administration-grist" with { type: "json" };
import administration_blacklist from "#data/administration_blacklist" with { type: "json" };
import administration_whitelist from "#data/administration_whitelist" with { type: "json" };
import operateurs_lolf from "#data/operateurs_lolf" with { type: "json" };

//

// Source: https://grist.numerique.gouv.fr/o/docs/1e4iraESY7dQ/Liste-des-administrations
export const ADMINISTRATIONS = administrations;

// SIREN blacklist - entities that are never considered administrations
// Source: https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/f1e56ac476b0b1730115f7b1f0667e8509ee5379/helpers/labels/administration_siren_blacklist.json (2025-09-30)
export const ADMINISTRATION_BLACKLIST = Object.keys(administration_blacklist);

// SIREN whitelist for specific administrations
// Source: https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/f1e56ac476b0b1730115f7b1f0667e8509ee5379/helpers/labels/administration_siren_whitelist.json (2025-09-30)
export const ADMINISTRATION_WHITELIST = Object.keys(administration_whitelist);

// SIREN whitelist for administrations d'État
// Source : https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/9b59d53790d0bda624866420d1914228e00c5612/helpers/labels/operateurs_lolf.json
export const ADMINISTRATION_ETAT_WHITELIST = Object.keys(operateurs_lolf);

// LEGACY EXPORTS vvv BELOW vvv FOR COMPATIBILITY PURPOSES - TO BE REMOVED IN THE FUTURE

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
