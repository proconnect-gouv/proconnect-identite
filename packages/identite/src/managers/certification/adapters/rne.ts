import type { IdentityVector } from "#src/types";
import type { FindPouvoirsBySirenHandler } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { match } from "ts-pattern";

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

  return {
    birthplace: descriptionPersonne?.lieuDeNaissance ?? null,
    birthdate,
    family_name: descriptionPersonne?.nom ?? null,
    gender: match(descriptionPersonne?.genre)
      .with("1", () => "male" as const)
      .with("2", () => "female" as const)
      .otherwise(() => null),
    given_name: descriptionPersonne?.prenoms?.join(" ") ?? null,
  };
}
