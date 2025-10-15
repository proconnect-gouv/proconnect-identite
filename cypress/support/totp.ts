import { createHmac } from "node:crypto";

/**
 * Decodes a base32 encoded string to a buffer
 */
function base32Decode(base32: string): Buffer {
  const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = base32.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < normalized.length; i++) {
    const idx = base32Chars.indexOf(normalized[i]);
    if (idx === -1) {
      throw new Error(`Invalid base32 character: ${normalized[i]}`);
    }
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

/**
 * Generates a TOTP token for the given secret
 * @param secret - Base32 encoded secret key
 * @param timeStep - Time step in seconds (default: 30)
 * @returns 6-digit TOTP token as a string
 */
export function generateToken(secret: string, timeStep: number = 30): string {
  // Decode the base32 secret
  const key = base32Decode(secret);

  // Calculate the time counter (number of time steps since Unix epoch)
  const time = Math.floor(Date.now() / 1000 / timeStep);

  // Convert time to 8-byte buffer (big-endian)
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time));

  // Generate HMAC-SHA1
  const hmac = createHmac("sha1", key);
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  // Dynamic truncation
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  // Generate 6-digit code
  const token = binary % 1000000;

  // Pad with leading zeros if necessary
  return token.toString().padStart(6, "0");
}
