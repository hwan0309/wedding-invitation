import "server-only";
import { randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

/** 링크용 짧은 ID(헷갈리는 문자 제외). 10자리 → 약 10^15 경우의 수 */
export function shortId(length = 10) {
  let id = "";
  for (let i = 0; i < length; i++) id += ALPHABET[randomInt(ALPHABET.length)];
  return id;
}

export const randomToken = (bytes = 24) => randomBytes(bytes).toString("base64url");

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 32);
  return `${salt.toString("base64url")}.${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltPart, hashPart] = stored.split(".");
  if (!saltPart || !hashPart) return false;
  const expected = Buffer.from(hashPart, "base64url");
  const actual = await scryptAsync(password, Buffer.from(saltPart, "base64url"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
