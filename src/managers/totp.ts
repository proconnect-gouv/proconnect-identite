import { isEmpty } from "lodash-es";
import { Secret, TOTP } from "otpauth";
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
  let totpKey = existingTotpKey ?? new Secret({ size: 20 }).base32;

  const totp = new TOTP({
    issuer: APPLICATION_NAME,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: totpKey,
  });

  const uri = totp.toString();

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

  if (!temporaryTotpKey) {
    throw new InvalidTotpTokenError();
  }

  const totp = new TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: temporaryTotpKey,
  });

  const delta = totp.validate({ token: totpToken, window: 2 });
  if (delta === null) {
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

  return temporaryForce2fa ? enableForce2fa(user_id) : disableForce2fa(user_id);
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

  const totp = new TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: decryptedTotpKey,
  });

  const delta = totp.validate({ token, window: 2 });
  if (delta === null) {
    throw new InvalidTotpTokenError();
  }

  return user;
};
