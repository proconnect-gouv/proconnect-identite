import {
  generateDicewarePhrase,
  hashPassword,
  normalizeDicewareWords,
  validateRecoveryWords,
} from "@proconnect-gouv/proconnect.core/security";
import { UserIsNot2faCapableError } from "../config/errors";
import { context } from "../connectors/context";
import { is2FACapable } from "./2fa";

export const hasRecoveryWordsConfiguredForUser = async (user_id: number) => {
  const recoveryWords =
    await context.repository.recovery_words.findByUserId(user_id);
  return recoveryWords !== undefined;
};

export const getRecoveryWordsCreatedAt = async (user_id: number) => {
  const recoveryWords =
    await context.repository.recovery_words.findByUserId(user_id);
  return recoveryWords?.created_at ?? null;
};

export const createRecoveryWordsForUser = async (user_id: number) => {
  if (!(await is2FACapable(user_id))) {
    throw new UserIsNot2faCapableError();
  }

  const recoveryWords = generateDicewarePhrase(6);
  const hashedRecoveryWords = await hashPassword(
    normalizeDicewareWords(recoveryWords),
  );

  await context.repository.recovery_words.deleteByUserId(user_id);
  await context.repository.recovery_words.create({
    user_id,
    hashed_words: hashedRecoveryWords,
  });

  return recoveryWords;
};

export const verifyRecoveryWordsForUser = async (
  user_id: number,
  input: string,
) => {
  const recoveryWords =
    await context.repository.recovery_words.findByUserId(user_id);

  return validateRecoveryWords(input, recoveryWords?.hashed_words ?? null);
};
