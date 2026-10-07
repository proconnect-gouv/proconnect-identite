import { context } from "../connectors/context";

export const hasRecoveryWordsConfiguredForUser = async (user_id: number) => {
  const recoveryCodes =
    await context.repository.recovery_codes.findByUserId(user_id);
  return recoveryCodes.length > 0;
};
