import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SymmetricEncryptionError } from "../src/config/errors";
import {
  decryptSymmetric,
  encryptSymmetric,
} from "../src/services/symmetric-encryption";

const key = "aTrueRandom32BytesLongBase64EncodedStringAA=";

describe("Symmetric encryption with aes-128-ccm", () => {
  it("should encrypt and decrypt string", () => {
    const plain = "Bonjour monde !";
    const encryptedText = encryptSymmetric(key, plain);
    assert.equal(decryptSymmetric(key, encryptedText), plain);
  });

  it("should throw SymmetricEncryptionError when encrypted text is null", () => {
    assert.throws(
      () => decryptSymmetric(key, null),
      new SymmetricEncryptionError("Invalid encrypted text format"),
    );
  });

  it("should throw SymmetricEncryptionError when encrypted string has invalid format", () => {
    assert.throws(
      () => decryptSymmetric(key, "invalid.format"),
      new SymmetricEncryptionError("Invalid encrypted text format"),
    );
  });

  it("should throw SymmetricEncryptionError when decrypting with wrong key", () => {
    const plain = "Bonjour monde !";
    const encryptedText = encryptSymmetric(key, plain);
    const wrongKey = "bTrueRandom32BytesLongBase64EncodedStringBB=";

    assert.throws(
      () => decryptSymmetric(wrongKey, encryptedText),
      new Error("Unsupported state or unable to authenticate data"),
    );
  });
});
