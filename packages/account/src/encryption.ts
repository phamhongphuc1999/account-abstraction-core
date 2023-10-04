// const EXPORT_FORMAT = 'jwk';
const DERIVED_KEY_ALGORITHM = 'PBKDF2';
const DERIVED_KEY_FORMAT = 'AES-GCM';
const DERIVED_HASH = 'SHA-256';
const STRING_ENCODING = 'utf-8';

/**
 * Generate a CryptoKey from a password and random salt.
 *
 * @param password - The password to use to generate key.
 * @param salt - The salt string to use in key derivation.
 * @param exportable - Should the derived key be exportable.
 * @returns A CryptoKey for encryption and decryption.
 */
export async function keyFromPassword(
  password: string,
  salt = '',
  exportable = false,
): Promise<CryptoKey> {
  const passBuffer = Buffer.from(password, STRING_ENCODING);
  const saltBuffer = salt == '' ? generateSalt() : Buffer.from(salt, 'base64');

  const key = await global.crypto.subtle.importKey(
    'raw',
    passBuffer,
    { name: DERIVED_KEY_ALGORITHM },
    false,
    ['deriveBits', 'deriveKey'],
  );

  const derivedKey = await global.crypto.subtle.deriveKey(
    {
      name: DERIVED_KEY_ALGORITHM,
      salt: saltBuffer,
      iterations: 10000,
      hash: DERIVED_HASH,
    },
    key,
    { name: DERIVED_KEY_FORMAT, length: 256 },
    exportable,
    ['encrypt', 'decrypt'],
  );

  return derivedKey;
}

/**
 * Generates a random string for use as a salt in CryptoKey generation.
 *
 * @param byteLength - The number of bytes to generate.
 * @returns A randomly generated string.
 */
export function generateSalt(byteLength = 32): ArrayBuffer {
  return global.crypto.getRandomValues(new Uint8Array(byteLength)).buffer;
}
