import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeBase64URL, encodeBase64URL } from "../src/services/base64"; // Replace with the actual path of your module

describe("Base64URL Encoding and Decoding", () => {
  it("should encode a Uint8Array to a base64 URL string", () => {
    const input = new Uint8Array([72, 101, 108, 108, 111]); // "Hello" in ASCII
    const encoded = encodeBase64URL(input);
    assert.equal(encoded, "SGVsbG8");
  });

  it("should decode a base64 URL string to a Uint8Array", () => {
    const input = "SGVsbG8"; // Base64 URL for "Hello"
    const decoded = decodeBase64URL(input);
    assert.deepEqual(decoded, new Uint8Array([72, 101, 108, 108, 111])); // "Hello" in ASCII
  });

  it("should encode and then decode to the original Uint8Array", () => {
    const original = new Uint8Array([1, 2, 3, 4, 5]);
    const encoded = encodeBase64URL(original);
    const decoded = decodeBase64URL(encoded);
    assert.deepEqual(decoded, original);
  });
});
