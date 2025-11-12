import type { IdentityVector } from "#src/types";
import type { FindPouvoirsBySirenHandler } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { match } from "ts-pattern";
import {
  convertCountryIsoToCog,
  isValidBirthplaceFormat,
} from "../birthplace-conversion.js";

//

export function toIdentityVector(
  pouvoir: NonNullable<Awaited<ReturnType<FindPouvoirsBySirenHandler>>[number]>,
): IdentityVector {
  const descriptionPersonne = pouvoir.individu?.descriptionPersonne;

  const dateMatch = String(descriptionPersonne?.dateDeNaissance).match(
    /^(?<year>\d+)-(?<month>\d{2})-(?<day>\d{2})$/,
  );
  const { day, month, year } = dateMatch?.groups ?? {
    day: NaN,
    month: NaN,
    year: NaN,
  };
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const birthdate = isNaN(date.getTime()) ? null : date;

  // For RNE:
  // birthplace: Use codeInseeGeographique only if:
  //   - codePostalNaissance is present
  //   - codeInseeGeographique has valid format (5 digits or 2A/2B + 3 digits)
  //   - first 2 chars are not "99" (not a foreign country code)
  let birthplace: string | null = null;
  const codeInseeGeographique = descriptionPersonne?.codeInseeGeographique;
  const codePostalNaissance = descriptionPersonne?.codePostalNaissance;

  if (
    codePostalNaissance &&
    codeInseeGeographique &&
    isValidBirthplaceFormat(codeInseeGeographique) &&
    !codeInseeGeographique.startsWith("99")
  ) {
    birthplace = codeInseeGeographique;
  }

  // birthcountry: Convert paysNaissance from ISO 3166 to COG format
  let birthcountry: string | null = null;
  const codePaysNaissance = descriptionPersonne?.codePaysNaissance;

  if (codePaysNaissance) {
    birthcountry = convertCountryIsoToCog(codePaysNaissance);
  }

  return {
    birthcountry,
    birthdate,
    birthplace,
    family_name: descriptionPersonne?.nom ?? null,
    gender: match(descriptionPersonne?.genre)
      .with("1", () => "male" as const)
      .with("2", () => "female" as const)
      .otherwise(() => null),
    given_name: descriptionPersonne?.prenoms?.join(" ") ?? null,
  };
}
