//

const VISIBLE_CHAR_REGEX = /[^\s\p{Cf}\p{Cc}\p{Zl}\p{Zp}]/u;

export function isVisibleString(input: string) {
  return VISIBLE_CHAR_REGEX.test(input);
}
