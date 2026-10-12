//

export function normalizeRecoveryWords(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .split(/[\s-]+/)
    .filter(Boolean)
    .join(" ");
}
