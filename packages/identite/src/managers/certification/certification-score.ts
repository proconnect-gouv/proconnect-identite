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
  const matches = new Set<MatchCriteria>();

  // 1. Family name match (after normalization)
  const normalizedFamilyNamePivot = normalizeText(identitePivot.family_name);
  const normalizedFamilyNameSource = normalizeText(sourceDirigeant.family_name);

  if (
    normalizedFamilyNamePivot &&
    normalizedFamilyNameSource &&
    normalizedFamilyNamePivot === normalizedFamilyNameSource
  ) {
    matches.add(MatchCriteria.enum.family_name);
  }

  // 2. First name match (first name only, after normalization)
  const firstNamePivot = extractFirstName(identitePivot.given_name);
  const firstNameSource = extractFirstName(sourceDirigeant.given_name);

  if (firstNamePivot && firstNameSource && firstNamePivot === firstNameSource) {
    matches.add(MatchCriteria.enum.first_name);
  }

  // 3. Gender match (match or absent in source)
  if (
    !sourceDirigeant.gender ||
    identitePivot.gender === sourceDirigeant.gender
  ) {
    matches.add(MatchCriteria.enum.gender);
  }

  // 4. Birth date match (exact match)
  if (
    identitePivot.birthdate &&
    sourceDirigeant.birthdate &&
    identitePivot.birthdate.getTime() === sourceDirigeant.birthdate.getTime()
  ) {
    matches.add(MatchCriteria.enum.birth_date);
  }

  // 5. Birth place match (different logic for French vs foreigners)
  const isFrench =
    !identitePivot.birthcountry || identitePivot.birthcountry === "99100";

  if (isFrench) {
    // For French: check commune code (with conversion)
    const communePivot = convertCommuneCode(identitePivot.birthplace);
    const communeSource = convertCommuneCode(sourceDirigeant.birthplace);

    // Match if equal or if source has no commune data
    if (!communeSource || (communePivot && communePivot === communeSource)) {
      matches.add(MatchCriteria.enum.birth_place);
    }
  } else {
    // For foreigners: check country code (with conversion if needed from RNE)
    // Both should already be in COG format (99XXX)
    if (
      identitePivot.birthcountry === null ||
      sourceDirigeant.birthcountry === null ||
      identitePivot.birthcountry === sourceDirigeant.birthcountry
    ) {
      matches.add(MatchCriteria.enum.birth_country);
    }
  }

  return matches;
}
