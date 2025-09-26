import { exportJWK, generateKeyPair } from "jose";

export async function create_jwks() {
  const keys = [];

  // Generate RSA keys for signing and encryption (2048 bits)
  const rsaSig = await generateKeyPair("RS256", { extractable: true });
  const rsaEnc = await generateKeyPair("RSA-OAEP", { extractable: true });

  // Generate EC P-256 keys for signing and encryption
  const ecSig = await generateKeyPair("ES256", { extractable: true });
  const ecEnc = await generateKeyPair("ECDH-ES", { extractable: true });

  // Generate EdDSA key for signing
  const edSig = await generateKeyPair("EdDSA", { extractable: true });

  // Export all private keys to JWK format
  const rsaSigJwk = await exportJWK(rsaSig.privateKey);
  const rsaEncJwk = await exportJWK(rsaEnc.privateKey);
  const ecSigJwk = await exportJWK(ecSig.privateKey);
  const ecEncJwk = await exportJWK(ecEnc.privateKey);
  const edSigJwk = await exportJWK(edSig.privateKey);

  // Add use parameter and collect all keys
  keys.push({ ...rsaSigJwk, use: "sig" });
  keys.push({ ...rsaEncJwk, use: "enc" });
  keys.push({ ...ecSigJwk, use: "sig" });
  keys.push({ ...ecEncJwk, use: "enc" });
  keys.push({ ...edSigJwk, use: "sig" });

  return { keys };
}
