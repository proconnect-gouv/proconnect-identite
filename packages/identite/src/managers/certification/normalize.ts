//

/**
 * Normalizes text for identity matching:
 * - Convert to uppercase
 * - Replace accented characters with their simple versions
 * - Replace special characters (including ' and -) with spaces
 * - Remove multiple consecutive spaces
 * - Trim leading and trailing spaces
 *
 * @param text - The text to normalize
 * @returns The normalized text
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return "";

  // Convert to uppercase
  let normalized = text.toUpperCase();

  // Replace accented characters with their simple versions: decompose them
  // (NFD) and drop the combining marks, so that every Latin diacritic is
  // covered and precomposed and decomposed inputs normalize the same way
  normalized = normalized.normalize("NFD").replace(/\p{M}/gu, "");

  // Ligatures do not decompose
  const ligatureMap: Record<string, string> = {
    Æ: "AE",
    Œ: "OE",
  };

  for (const [ligature, simple] of Object.entries(ligatureMap)) {
    normalized = normalized.replaceAll(ligature, simple);
  }

  // Replace special characters (including ' and -) with spaces
  // Keep only letters, digits, and spaces
  normalized = normalized.replace(/[^A-Z0-9 ]/g, " ");

  // Remove multiple consecutive spaces
  normalized = normalized.replace(/\s+/g, " ");

  // Trim leading and trailing spaces
  normalized = normalized.trim();

  return normalized;
}

/**
 * Extracts the first name from a normalized full name string.
 * The first name is the part before the first space.
 *
 * @param givenName - The full given name (may contain multiple names)
 * @returns The first name only
 */
export function extractFirstName(givenName: string | null | undefined): string {
  if (!givenName) return "";

  const normalized = normalizeText(givenName);
  const parts = normalized.split(" ");
  return parts[0] || "";
}
