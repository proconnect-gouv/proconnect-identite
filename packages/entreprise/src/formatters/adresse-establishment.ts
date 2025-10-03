//

import type { InseeAddressEstablishment } from "#src/types";
import { capitalize } from "lodash-es";

//

const emptyInseeAddressEstablishment = {
  complement_adresse: null,
  distribution_speciale: null,
  indice_repetition_voie: null,
  libelle_voie: null,
  numero_voie: null,
  type_voie: null,
  code_postal: null,
};

export function formatAddress(inseeAddress: InseeAddressEstablishment) {
  const isPartiallyNonDiffusible =
    inseeAddress.status_diffusion === "partiellement_diffusible";

  const {
    complement_adresse,
    distribution_speciale,
    indice_repetition_voie,
    libelle_voie,
    numero_voie,
    type_voie,
  } = isPartiallyNonDiffusible ? emptyInseeAddressEstablishment : inseeAddress;
  const {
    libelle_commune,
    code_cedex,
    libelle_cedex,
    libelle_commune_etranger,
    code_pays_etranger,
    libelle_pays_etranger,
  } = inseeAddress;
  const code_postal = isPartiallyNonDiffusible
    ? inseeAddress.code_commune
    : (inseeAddress.code_postal ?? code_cedex);
  return [
    wrapWord(complement_adresse, ", ", true),
    wrapWord(numero_voie),
    wrapWord(indice_repetition_voie),
    wrapWord(type_voie),
    wrapWord(libelle_voie, ", "),
    wrapWord(distribution_speciale, ", "),
    wrapWord(code_postal),
    wrapWord(
      libelle_commune ?? libelle_cedex ?? libelle_commune_etranger,
      code_pays_etranger ? ", " : "",
      true,
    ),
    wrapWord(code_pays_etranger, ", "),
    libelle_pays_etranger,
  ].join("");
}

const wrapWord = (word: string | null, punct = " ", caps = false) => {
  if (!word) {
    return "";
  }
  if (caps) {
    return capitalize(word) + punct;
  }
  return word.toString().toLowerCase() + punct;
};
