import type { IdentityVector } from "#src/types";
import { formatBirthdate } from "@proconnect-gouv/proconnect.insee/formatters";
import type { InseeUniteLegale } from "@proconnect-gouv/proconnect.insee/types";

//

export function toIdentityVector(
  uniteLegale: InseeUniteLegale,
): IdentityVector {
  let birthdate: Date | null = null;
  if (uniteLegale?.dateNaissanceUniteLegale) {
    const parsedDate = formatBirthdate(
      String(uniteLegale.dateNaissanceUniteLegale),
    );
    birthdate = isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  return {
    birthplace: uniteLegale?.codeCommuneNaissanceUniteLegale ?? null,
    birthdate,
    family_name: uniteLegale?.nomUniteLegale ?? null,
    given_name: [
      uniteLegale?.prenom1UniteLegale,
      uniteLegale?.prenom2UniteLegale,
      uniteLegale?.prenom3UniteLegale,
      uniteLegale?.prenom4UniteLegale,
    ]
      .filter(Boolean)
      .join(" "),
  };
}
