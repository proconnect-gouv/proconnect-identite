import { customAlphabet } from "nanoid";

const generateHex = customAlphabet("0123456789abcdef", 20);

export const generateRecoveryCode = (): string => {
  const raw = generateHex();
  return raw.match(/.{1,5}/g)!.join("-");
};

export const generateRecoveryCodes = (count = 10): string[] => {
  return Array.from({ length: count }, generateRecoveryCode);
};
