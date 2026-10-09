//

import administration_blacklist from "#data/administration_blacklist" with { type: "json" };
import administration_whitelist from "#data/administration_whitelist" with { type: "json" };
import administrations from "#data/codes-juridiques-to-administration-grist" with { type: "json" };

//

// Source: https://grist.numerique.gouv.fr/o/datagouv/dkBFLyepK16P/Liste-des-administrations/p/1
export const ADMINISTRATIONS = administrations;

// SIREN blacklist - entities that are never considered administrations
// Source: https://grist.numerique.gouv.fr/o/datagouv/dkBFLyepK16P/Liste-des-administrations/p/2
export const ADMINISTRATION_BLACKLIST = administration_blacklist.map(
  ({ siren }) => siren,
);

// SIREN whitelist for administrations
// Source: https://grist.numerique.gouv.fr/o/datagouv/dkBFLyepK16P/Liste-des-administrations/p/3
export const ADMINISTRATION_WHITELIST = administration_whitelist.map(
  ({
    siren,
    Administration_de_l_Etat_services_centraux_deconcentres_et_criteres_de_regie_ou_quasi_regie_,
  }) => ({
    siren,
    isAdministrationEtat:
      Administration_de_l_Etat_services_centraux_deconcentres_et_criteres_de_regie_ou_quasi_regie_,
  }),
);
