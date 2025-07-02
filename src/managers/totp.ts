import { generateSecret, generateUri, validateToken } from "@sunknudsen/totp";
import { isEmpty } from "lodash-es";
import qrcode from "qrcode";
import {
  APPLICATION_NAME,
  SYMMETRIC_ENCRYPTION_KEY,
  WEBSITE_IDENTIFIER,
} from "../config/env";
import { InvalidTotpTokenError } from "../config/errors";
import { getById, update } from "../repositories/user";
import {
  decryptSymmetric,
  encryptSymmetric,
} from "../services/symmetric-encryption";
import { disableForce2fa, enableForce2fa, is2FACapable } from "./2fa";

export const generateTotpRegistrationOptions = async (
  email: string,
  existingTotpKey: string | null,
) => {
  let totpKey = existingTotpKey ?? generateSecret(32);

  const uri = generateUri(APPLICATION_NAME, email, totpKey, WEBSITE_IDENTIFIER);

  // lower case for easier usage (no caps lock required)
  // add a space every 4 char for better readability
  const humanReadableTotpKey = totpKey
    .toLowerCase()
    .replace(/.{4}(?=.)/g, "$& ");

  const qrCodeDataUrl = await new Promise((resolve, reject) => {
    qrcode.toDataURL(uri, (error, url) => {
      if (error) {
        reject(error);
      } else {
        resolve(url);
      }
    });
  });

  return { totpKey, humanReadableTotpKey, qrCodeDataUrl };
};

export const confirmTotpRegistration = async (
  user_id: number,
  temporaryTotpKey: string | undefined,
  totpToken: string,
  temporaryForce2fa: boolean,
) => {
  // ASSERTION: user exists
  await getById(user_id);

  if (!temporaryTotpKey || !validateToken(temporaryTotpKey, totpToken, 2)) {
    throw new InvalidTotpTokenError();
  }

  const encrypted_totp_key = encryptSymmetric(
    SYMMETRIC_ENCRYPTION_KEY,
    temporaryTotpKey,
  );

  await update(user_id, {
    encrypted_totp_key,
    totp_key_verified_at: new Date(),
  });

  if (temporaryForce2fa) {
    return await enableForce2fa(user_id);
  } else {
    return await disableForce2fa(user_id);
  }
};

export const deleteTotpConfiguration = async (user_id: number) => {
  let user = await getById(user_id);

  user = await update(user_id, {
    encrypted_totp_key: null,
    totp_key_verified_at: null,
  });

  if (!(await is2FACapable(user_id))) {
    user = await disableForce2fa(user_id);
  }

  return user;
};

export const isTotpConfiguredForUser = async (user_id: number) => {
  const user = await getById(user_id);
  return !isEmpty(user.encrypted_totp_key);
};

export const authenticateWithTotp = async (user_id: number, token: string) => {
  const user = await getById(user_id);
  const decryptedTotpKey = decryptSymmetric(
    SYMMETRIC_ENCRYPTION_KEY,
    user.encrypted_totp_key,
  );

  if (!validateToken(decryptedTotpKey, token, 2)) {
    throw new InvalidTotpTokenError();
  }

  return user;
};
