import type { IdentityVector } from "#src/types";
import type { InfogreffeSirenMandatairesSociaux } from "@proconnect-gouv/proconnect.api_entreprise/types";

//

export function toIdentityVector(
  mandataire: InfogreffeSirenMandatairesSociaux,
): IdentityVector {
  const birthdate = new Date(mandataire.date_naissance_timestamp || NaN);
  return {
    birthplace: mandataire.lieu_naissance ?? null,
    birthdate: isNaN(birthdate.getTime()) ? null : birthdate,
    family_name: mandataire.nom ?? null,
    given_name: mandataire.prenom ?? null,
  };
}
