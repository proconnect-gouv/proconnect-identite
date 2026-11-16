import {
  generateDicewarePhrase,
  hashPassword,
  normalizeDicewareWords,
  validatePassword,
} from "@proconnect-gouv/proconnect.core/security";
import type { Request } from "express";
import {
  InvalidRecoveryWordsError,
  UserIsNot2faCapableError,
} from "../config/errors";
import { context } from "../connectors/context";
import { is2FACapable } from "./2fa";
import { deleteTotpConfiguration } from "./totp";
import { sendRecoveryWordsGeneratedMail } from "./user";
import { deleteAllUserAuthenticators } from "./webauthn";

export const hasRecoveryWordsConfiguredForUser = async (user_id: number) => {
  const recoveryWords =
    await context.repository.recovery_words.findByUserId(user_id);
  return recoveryWords !== undefined;
};

// The flag is not restored by createAuthenticatedSession:
// the incentive is shown again at each sign-in.
export const markRecoveryWordsIncentiveAsSeen = (req: Request) => {
  req.session.hasSeenRecoveryWordsIncentive = true;
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

  const regenerated = await hasRecoveryWordsConfiguredForUser(user_id);

  const recoveryWords = generateDicewarePhrase(6);
  const hashedRecoveryWords = await hashPassword(
    normalizeDicewareWords(recoveryWords),
  );

  await context.repository.recovery_words.deleteByUserId(user_id);
  await context.repository.recovery_words.create({
    user_id,
    hashed_words: hashedRecoveryWords,
  });

  await sendRecoveryWordsGeneratedMail({ user_id, regenerated });

  return recoveryWords;
};

export const verifyRecoveryWordsForUser = async (
  user_id: number,
  input: string,
) => {
  const recoveryWords =
    await context.repository.recovery_words.findByUserId(user_id);

  return validatePassword(input, recoveryWords?.hashed_words ?? null);
};

export const recoverUserAccount = async (user_id: number, input: string) => {
  const isValid = await verifyRecoveryWordsForUser(user_id, input);
  if (!isValid) {
    throw new InvalidRecoveryWordsError();
  }

  await deleteAllUserAuthenticators(user_id);

  const updatedUser = await deleteTotpConfiguration(user_id);

  await context.repository.recovery_words.deleteByUserId(user_id);

  return updatedUser;
};
