import * as Crypto from 'expo-crypto';

const PASSWORD_ITERATIONS = 1000;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createPasswordMaterial(password: string) {
  const salt = bytesToHex(Crypto.getRandomBytes(16));
  const passwordHash = await derivePassword(password, salt, PASSWORD_ITERATIONS);

  return { passwordSalt: salt, passwordHash, passwordIterations: PASSWORD_ITERATIONS };
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
  iterations: number,
) {
  return (await derivePassword(password, salt, iterations)) === expectedHash;
}

async function derivePassword(password: string, salt: string, iterations: number) {
  let value = `${salt}:${password}`;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    value = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
  }

  return value;
}