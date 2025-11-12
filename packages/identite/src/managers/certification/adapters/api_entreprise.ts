import type { IdentityVector } from "#src/types";
import type { InfogreffeSirenMandatairesSociaux } from "@proconnect-gouv/proconnect.api_entreprise/types";
import { convertCountryIsoToCog } from "../birthplace-conversion.js";

//

export function toIdentityVector(
  mandataire: InfogreffeSirenMandatairesSociaux,
): IdentityVector {
  const birthcountry = convertCountryIsoToCog(mandataire.code_pays_naissance);
  const birthdate = new Date(mandataire.date_naissance_timestamp || NaN);

  return {
    birthcountry,
    birthdate: isNaN(birthdate.getTime()) ? null : birthdate,
    birthplace: null, // API Entreprise Infogreffe doesn't provide Insee code for birthplace
    family_name: mandataire.nom ?? null,
    gender: null, // API Entreprise Infogreffe doesn't provide gender
    given_name: mandataire.prenom ?? null,
  };
}
