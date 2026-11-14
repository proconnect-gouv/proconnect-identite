import {
  generateDicewarePhrase,
  hashPassword,
  normalizeDicewareWords,
  validatePassword,
} from "@proconnect-gouv/proconnect.core/security";
import type { Request } from "express";
import { match } from "ts-pattern";
import { UserIsNot2faCapableError } from "../config/errors";
import { context, runtime } from "../connectors/context";

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
  const recoveryWords = generateDicewarePhrase(6);
  const hashedRecoveryWords = await hashPassword(
    normalizeDicewareWords(recoveryWords),
  );

  const outcome = await runtime
    .as({ type: "user", user_id })
    .user.recovery_words_regenerated.mutate({
      hashed_words: hashedRecoveryWords,
      user_id,
    });

  return match(outcome)
    .with({ kind: "not_2fa_capable" }, () => {
      throw new UserIsNot2faCapableError();
    })
    .with({ kind: "recovery_words_regenerated" }, () => recoveryWords)
    .exhaustive();
};

export const verifyRecoveryWordsForUser = async (
  user_id: number,
  input: string,
) => {
  const recoveryWords =
    await context.repository.recovery_words.findByUserId(user_id);

  return validatePassword(input, recoveryWords?.hashed_words ?? null);
};
