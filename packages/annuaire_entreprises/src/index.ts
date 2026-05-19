//

import administrations from "#data/administration-grist" with { type: "json" };
import administration_blacklist from "#data/administration_blacklist" with { type: "json" };
import administration_whitelist from "#data/administration_whitelist" with { type: "json" };

//

// Source: https://grist.numerique.gouv.fr/o/docs/1e4iraESY7dQ/Liste-des-administrations
export const ADMINISTRATIONS = administrations;

// SIREN blacklist - entities that are never considered administrations
// Source: https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/f1e56ac476b0b1730115f7b1f0667e8509ee5379/helpers/labels/administration_siren_blacklist.json (2025-09-30)
export const ADMINISTRATION_BLACKLIST = Object.keys(administration_blacklist);

// SIREN whitelist for specific administrations
// Source: https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/f1e56ac476b0b1730115f7b1f0667e8509ee5379/helpers/labels/administration_siren_whitelist.json (2025-09-30)
export const ADMINISTRATION_WHITELIST = Object.keys(administration_whitelist);
