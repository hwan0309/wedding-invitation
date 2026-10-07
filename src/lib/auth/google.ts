import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { OAuthProfile } from "./oauth";

// 구글 공개키로 ID 토큰 서명을 검증한다(키는 jose가 받아서 캐시한다).
const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

const text = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * 구글 ID 토큰 검증. 원탭(브라우저에서 받은 토큰)은 nonce까지 확인해 재사용 공격을 막는다.
 */
export async function verifyGoogleIdToken(idToken: string, expectedNonce?: string): Promise<OAuthProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not set");

  const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: clientId,
  });
  if (expectedNonce !== undefined && payload.nonce !== expectedNonce) throw new Error("nonce mismatch");
  if (!payload.sub) throw new Error("id token has no subject");

  const email = text(payload.email);
  return {
    providerUserId: payload.sub,
    name: text(payload.name) || email.split("@")[0] || "Google 사용자",
    email: payload.email_verified === true ? email : "",
    image: text(payload.picture),
  };
}
