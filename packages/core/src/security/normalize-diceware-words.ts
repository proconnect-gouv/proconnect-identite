// about removing diacritics see https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
export const normalizeDicewareWords = (rawToken: string) =>
  rawToken
    .trim()
    .normalize("NFD")
    .toLowerCase()
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/gu, "-");
