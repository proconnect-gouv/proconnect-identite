import type { IdentityVector } from "#src/types";
import { formatBirthdate } from "@proconnect-gouv/proconnect.insee/formatters";
import type { InseSirenUniteLegale } from "@proconnect-gouv/proconnect.insee/types";
import { match } from "ts-pattern";

//

export function toIdentityVector(
  uniteLegale: InseSirenUniteLegale,
): IdentityVector {
  let birthdate: Date | null = null;
  const nomUniteLegale = uniteLegale.periodesUniteLegale?.at(0)?.nomUniteLegale;

  if (uniteLegale?.dateNaissanceUniteLegale) {
    const parsedDate = formatBirthdate(
      String(uniteLegale.dateNaissanceUniteLegale),
    );
    birthdate = isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  return {
    birthcountry: uniteLegale?.codePaysNaissanceUniteLegale ?? null,
    birthdate,
    birthplace: uniteLegale?.codeCommuneNaissanceUniteLegale ?? null,
    family_name: nomUniteLegale ?? null,
    gender: match(uniteLegale?.sexeUniteLegale)
      .with("M", () => "male" as const)
      .with("F", () => "female" as const)
      .otherwise(() => null),
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
