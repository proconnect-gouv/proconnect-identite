import { customAlphabet } from "nanoid";
import { context } from "../connectors/context";

const generateHex = customAlphabet("0123456789abcdef", 20);

export const generateRecoveryCode = (): string => {
  const raw = generateHex();
  return raw.match(/.{1,5}/g)!.join("-");
};

export const generateRecoveryCodes = (count = 10): string[] => {
  return Array.from({ length: count }, generateRecoveryCode);
};

export const hasRecoveryCodesConfiguredForUser = async (user_id: number) => {
  const recoveryCodes =
    await context.repository.recovery_codes.findByUserId(user_id);
  return recoveryCodes.length > 0;
};
