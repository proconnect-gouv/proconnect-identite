import { isEmpty } from "lodash-es";
import { Secret, TOTP } from "otpauth";
import qrcode from "qrcode";
import { APPLICATION_NAME, SYMMETRIC_ENCRYPTION_KEY } from "../config/env";
import { InvalidTotpTokenError } from "../config/errors";
import { context } from "../connectors/context";
import { decryptSymmetric } from "../services/symmetric-encryption";

const { users } = context.repository;

export const generateTotpRegistrationOptions = async (
  email: string,
  existingTotpKey: string | null,
) => {
  const totpKey = existingTotpKey ?? new Secret({ size: 32 }).base32;

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

export const isTotpConfiguredForUser = async (user_id: number) => {
  const user = await users.getById(user_id);
  return !isEmpty(user.encrypted_totp_key);
};

export const authenticateWithTotp = async (user_id: number, token: string) => {
  const user = await users.getById(user_id);
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
