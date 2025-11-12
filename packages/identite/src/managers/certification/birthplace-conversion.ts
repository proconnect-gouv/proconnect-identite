//

import {
  COMMUNE_CODE_CONVERSION,
  COUNTRY_ISO_TO_COG,
} from "#src/data/certification";

/**
 * Converts a commune code to a canonical representation,
 * ensuring consistency across historical and current versions.
 * If the code is not in the conversion table, returns the original code.
 *
 * @param communeCode - The commune code to convert (format: XXXXX or 2AXXX or 2BXXX)
 * @returns The converted code, or the original if no conversion is needed
 */
export function convertCommuneCode(
  communeCode: string | null | undefined,
): string | null {
  if (!communeCode) return null;

  // Check if the code needs conversion
  const converted = COMMUNE_CODE_CONVERSION[communeCode];
  return converted || communeCode;
}

/**
 * Converts an ISO 3166 country code (2 or 3-letter) to COG format (5-digit).
 *
 * @param iso3166Code - The ISO 3166 country code (e.g., "IRL", "FRA")
 * @returns The COG code (e.g., "99136"), or null if not found
 */
export function convertCountryIsoToCog(
  iso3166Code: string | null | undefined,
): string | null {
  if (!iso3166Code) return null;

  const cogCode = COUNTRY_ISO_TO_COG[iso3166Code.toUpperCase()];
  return cogCode || null;
}

/**
 * Validates if a birthplace code has the correct COG format.
 * Valid formats:
 * - 5 digits (e.g., "75001")
 * - 2A or 2B + 3 digits (e.g., "2A001", "2B042" for Corsica)
 *
 * @param birthplaceCode - The birthplace code to validate
 * @returns true if the format is valid, false otherwise
 */
export function isValidBirthplaceFormat(
  birthplaceCode: string | null | undefined,
): boolean {
  if (!birthplaceCode) return false;

  // Match either 5 digits or 2A/2B + 3 digits
  const validFormat = /^(\d{5}|2[AB]\d{3})$/;
  return validFormat.test(birthplaceCode);
}
