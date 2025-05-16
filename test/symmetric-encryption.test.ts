import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decryptSymmetric,
  encryptSymmetric,
} from "../src/services/symmetric-encryption"; // Replace with the actual path of your module

const key = "aTrueRandom32BytesLongBase64EncodedStringAA=";

describe("Symmetric encryption with aes-128-ccm", () => {
  it("should encrypt and decrypt string", () => {
    const plain = "Bonjour monde !";
    const encryptedText = encryptSymmetric(key, plain);
    assert.equal(decryptSymmetric(key, encryptedText), plain);
  });

  it("should throw when encrypted string is null", () => {
    assert.throws(
      () => decryptSymmetric(key, null),
      new Error("Invalid encrypted text"),
    );
  });

  it("should throw when encrypted string is invalid", () => {
    assert.throws(
      () => decryptSymmetric(key, "null"),
      new Error("Invalid encrypted text"),
    );
  });
});
