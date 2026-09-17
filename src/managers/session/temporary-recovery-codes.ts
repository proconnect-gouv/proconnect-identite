import type { Request } from "express";
import { SYMMETRIC_ENCRYPTION_KEY } from "../../config/env";
import { UserNotLoggedInError } from "../../config/errors";
import {
  decryptSymmetric,
  encryptSymmetric,
} from "../../services/symmetric-encryption";
import { isWithinAuthenticatedSession } from "./authenticated";

export const setTemporaryRecoveryCodes = (
  req: Request,
  recoveryCodes: string[],
) => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  req.session.temporaryEncryptedRecoveryCodes = encryptSymmetric(
    SYMMETRIC_ENCRYPTION_KEY,
    JSON.stringify(recoveryCodes),
  );
};

export const getTemporaryRecoveryCodes = (req: Request): string[] | null => {
  if (!isWithinAuthenticatedSession(req.session)) {
    throw new UserNotLoggedInError();
  }

  if (!req.session.temporaryEncryptedRecoveryCodes) {
    return null;
  }

  const decrypted = decryptSymmetric(
    SYMMETRIC_ENCRYPTION_KEY,
    req.session.temporaryEncryptedRecoveryCodes,
  );

  return JSON.parse(decrypted);
};

export const deleteTemporaryRecoveryCodes = (req: Request) => {
  delete req.session.temporaryEncryptedRecoveryCodes;
};
