import type { IdentityVector } from "#src/types";
import type { FindBeneficiairesEffectifsBySirenHandler } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";

//

export function toIdentityVector(
  beneficiaire: NonNullable<
    Awaited<ReturnType<FindBeneficiairesEffectifsBySirenHandler>>[number]
  >,
): IdentityVector {
  const match = String(beneficiaire.descriptionPersonne?.dateDeNaissance).match(
    /^(?<year>\d+)-(?<month>\d{2})-(?<day>\d{2})$/,
  );
  const { day, month, year } = match?.groups ?? {
    day: NaN,
    month: NaN,
    year: NaN,
  };
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const birthdate = isNaN(date.getTime()) ? null : date;

  return {
    birthplace: beneficiaire.descriptionPersonne?.lieuDeNaissance ?? null,
    birthdate,
    family_name: beneficiaire.descriptionPersonne?.nom ?? null,
    given_name: beneficiaire.descriptionPersonne?.prenoms?.join(" ") ?? null,
  };
}
