// from https://medium.com/@tony.infisical/guide-to-nodes-crypto-module-for-encryption-decryption-65c077176980

import { isString } from "lodash-es";
import { AssertionError } from "node:assert";
import crypto from "node:crypto";
import { SymmetricEncryptionError } from "../config/errors";

export const encryptSymmetric = (key: string, plaintext: string) => {
  // create a random initialization vector
  const iv = crypto.randomBytes(12).toString("base64");

  // create a cipher object
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(key, "base64"),
    Buffer.from(iv, "base64"),
  );

  // update the cipher object with the plaintext to encrypt
  let ciphertext = cipher.update(plaintext, "utf8", "base64");

  // finalize the encryption process
  ciphertext += cipher.final("base64");

  // retrieve the authentication tag for the encryption
  const tag = cipher.getAuthTag().toString("base64");

  return [ciphertext, iv, tag].join(".");
};

export const decryptSymmetric = (key: string, encryptedText: any) => {
  if (!isString(encryptedText) || encryptedText.split(".").length !== 3) {
    throw new SymmetricEncryptionError("Invalid encrypted text format", {
      cause: isString(encryptedText)
        ? new AssertionError({
            expected: "An array of 3 strings",
            actual: encryptedText.split(".").length,
            operator: "!==",
          })
        : new AssertionError({
            expected: "A string",
            actual: encryptedText,
            operator: "isString",
          }),
    });
  }

  const [ciphertext, iv, tag] = encryptedText.split(".");

  // create a decipher object
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key, "base64"),
    Buffer.from(iv, "base64"),
  );

  // set the authentication tag for the decipher object
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  // update the decipher object with the base64-encoded ciphertext
  let plaintext = decipher.update(ciphertext, "base64", "utf8");

  // finalize the decryption process
  plaintext += decipher.final("utf8");

  return plaintext;
};
