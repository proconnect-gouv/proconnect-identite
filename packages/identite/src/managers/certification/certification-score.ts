//

import type { IdentityVector } from "#src/types";
import z from "zod/v4";
import { convertCommuneCode } from "./birthplace-conversion.js";
import { extractFirstName, normalizeText } from "./normalize.js";

//

export const MatchCriteria = z.enum([
  "birth_country",
  "birth_date",
  "birth_place",
  "family_name",
  "first_name",
  "gender",
]);
export type MatchCriteria = z.output<typeof MatchCriteria>;

/**
 * Calculates a certification score between identity from FranceConnect (IdentitePivot)
 * and executive identity from business registries (SourceDirigeant).
 *
 * The scoring system awards 1 point for each matching criterion:
 * - Family name (after normalization): 1 point
 * - First name (first name only, after normalization): 1 point
 * - Gender (match or absent in source): 1 point
 * - Birth date (exact match): 1 point
 * - Birth place:
 *   - For French (birthcountry = 99100 or null): commune match or absent in source: 1 point
 *   - For foreigners: country match: 1 point
 *
 * Maximum score: 5 points (required for certification)
 *
 * @param identitePivot - Identity from FranceConnect
 * @param sourceDirigeant - Executive identity from business registry
 * @returns Score from 0 to 5
 */
export function certificationScore(
  identitePivot: IdentityVector,
  sourceDirigeant: IdentityVector,
) {
  return new Set(
    compareCriteria(identitePivot, sourceDirigeant)
      .filter(({ matched }) => matched)
      .map(({ criterion }) => criterion),
  );
}

/**
 * Compares each evaluated criterion and keeps, for both sides, the value as
 * received (`raw`) and the value actually compared (`compared`).
 */
export function compareCriteria(
  identitePivot: IdentityVector,
  sourceDirigeant: IdentityVector,
) {
  // 1. Family name match (after normalization)
  const family_name = compare({
    criterion: MatchCriteria.enum.family_name,
    franceconnect: identitePivot.family_name,
    match: bothPresentAndEqual,
    normalize: normalizeText,
    source: sourceDirigeant.family_name,
  });

  // 2. First name match (first name only, after normalization)
  const first_name = compare({
    criterion: MatchCriteria.enum.first_name,
    franceconnect: identitePivot.given_name,
    match: bothPresentAndEqual,
    normalize: extractFirstName,
    source: sourceDirigeant.given_name,
  });

  // 3. Gender match (match or absent in source)
  const gender = compare({
    criterion: MatchCriteria.enum.gender,
    franceconnect: identitePivot.gender,
    match: (pivot, source) => !source || pivot === source,
    source: sourceDirigeant.gender,
  });

  // 4. Birth date match (exact match)
  const birth_date = compare({
    criterion: MatchCriteria.enum.birth_date,
    franceconnect: identitePivot.birthdate?.toISOString() ?? null,
    match: bothPresentAndEqual,
    source: sourceDirigeant.birthdate?.toISOString() ?? null,
  });

  // 5. Birth place match (different logic for French vs foreigners)
  const isFrench =
    !identitePivot.birthcountry || identitePivot.birthcountry === "99100";
  const birth = isFrench
    ? // For French: commune code (with conversion), match if source has none
      compare({
        criterion: MatchCriteria.enum.birth_place,
        franceconnect: identitePivot.birthplace,
        match: (pivot, source) => !source || (!!pivot && pivot === source),
        normalize: convertCommuneCode,
        source: sourceDirigeant.birthplace,
      })
    : // For foreigners: country code (COG 99XXX), match if either side has none
      compare({
        criterion: MatchCriteria.enum.birth_country,
        franceconnect: identitePivot.birthcountry,
        match: (pivot, source) =>
          pivot === null || source === null || pivot === source,
        source: sourceDirigeant.birthcountry,
      });

  return [family_name, first_name, gender, birth_date, birth];
}

function bothPresentAndEqual(pivot: string | null, source: string | null) {
  return !!pivot && !!source && pivot === source;
}

function compare({
  criterion,
  franceconnect,
  match,
  normalize = (value) => value,
  source,
}: {
  criterion: MatchCriteria;
  franceconnect: string | null;
  match: (pivot: string | null, source: string | null) => boolean;
  normalize?: (value: string | null) => string | null;
  source: string | null;
}) {
  const compared_franceconnect = normalize(franceconnect);
  const compared_source = normalize(source);

  return {
    criterion,
    franceconnect: { compared: compared_franceconnect, raw: franceconnect },
    matched: match(compared_franceconnect, compared_source),
    source: { compared: compared_source, raw: source },
  };
}
