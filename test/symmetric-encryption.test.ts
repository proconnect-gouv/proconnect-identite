import { expect } from "chai";
import { describe, it } from "node:test";
import {
  decryptSymmetric,
  encryptSymmetric,
} from "../src/services/symmetric-encryption"; // Replace with the actual path of your module

const key = "aTrueRandom32BytesLongBase64EncodedStringAA=";

describe("Symmetric encryption with aes-128-ccm", () => {
  it("should encrypt and decrypt string", () => {
    const plain = "Bonjour monde !";
    const encoded = encryptSymmetric(key, plain);
    expect(decryptSymmetric(key, encoded)).to.eql(plain);
  });

  it("should throw when encrypted string is null", () => {
    expect(() => decryptSymmetric(key, null)).to.throw(
      "Invalid encrypted text",
    );
  });

  it("should throw when encrypted string is invalid", () => {
    expect(() => decryptSymmetric(key, "null")).to.throw(
      "Invalid encrypted text",
    );
  });
});
