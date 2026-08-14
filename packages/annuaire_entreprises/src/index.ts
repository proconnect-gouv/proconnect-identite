//

import administration_blacklist from "#data/administration_blacklist" with { type: "json" };
import administration_whitelist from "#data/administration_whitelist" with { type: "json" };
import administrations from "#data/codes-juridiques-to-administration-grist" with { type: "json" };
import operateurs_lolf from "#data/operateurs_lolf" with { type: "json" };

//

// Source: https://grist.numerique.gouv.fr/o/docs/1e4iraESY7dQ/Liste-des-administrations
export const ADMINISTRATIONS = administrations;

// SIREN blacklist - entities that are never considered administrations
// Source: https://grist.numerique.gouv.fr/o/docs/1e4iraESY7dQ/Liste-des-administrations
export const ADMINISTRATION_BLACKLIST = administration_blacklist.map(
  ({ siren }) => siren,
);

// SIREN whitelist for specific administrations
// Source: https://grist.numerique.gouv.fr/o/docs/1e4iraESY7dQ/Liste-des-administrations
export const ADMINISTRATION_WHITELIST = administration_whitelist.map(
  ({ siren }) => siren,
);

// SIREN whitelist for administrations d'État
// Source : https://github.com/annuaire-entreprises-data-gouv-fr/search-infra/blob/9b59d53790d0bda624866420d1914228e00c5612/helpers/labels/operateurs_lolf.json
export const ADMINISTRATION_ETAT_WHITELIST = Object.keys(operateurs_lolf);
