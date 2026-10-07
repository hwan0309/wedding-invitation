import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { verifyGoogleIdToken } from "./google";

export type OAuthProvider = "kakao" | "google";

export interface OAuthProfile {
  providerUserId: string;
  name: string;
  email: string;
  image: string;
}

export const isOAuthProvider = (value: string): value is OAuthProvider =>
  value === "kakao" || value === "google";

function credentials(provider: OAuthProvider) {
  if (provider === "kakao") {
    // 카카오: [앱 키] > REST API 키, [보안] > Client Secret(사용하는 경우만)
    const clientId = process.env.KAKAO_CLIENT_ID;
    return clientId ? { clientId, clientSecret: process.env.KAKAO_CLIENT_SECRET || undefined } : null;
  }
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export const isProviderConfigured = (provider: OAuthProvider) => credentials(provider) !== null;

export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

const pkceChallenge = (verifier: string) => createHash("sha256").update(verifier).digest("base64url");

/** 로그인 동의 화면 주소 */
export function authorizationUrl(
  provider: OAuthProvider,
  options: { redirectUri: string; state: string; codeVerifier: string; selectAccount?: boolean },
) {
  const creds = credentials(provider);
  if (!creds) throw new Error(`${provider} login is not configured`);

  if (provider === "kakao") {
    // 동의 항목(닉네임·프로필 사진·이메일)은 카카오 디벨로퍼스 콘솔 설정을 따른다.
    const url = new URL("https://kauth.kakao.com/oauth/authorize");
    url.search = new URLSearchParams({
      response_type: "code",
      client_id: creds.clientId,
      redirect_uri: options.redirectUri,
      state: options.state,
    }).toString();
    return url;
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: creds.clientId,
    redirect_uri: options.redirectUri,
    scope: "openid email profile",
    state: options.state,
    code_challenge: pkceChallenge(options.codeVerifier),
    code_challenge_method: "S256",
    access_type: "online",
    include_granted_scopes: "true",
  });
  // 기본은 구글에 로그인된 계정으로 바로 진행(자동 로그인), 계정 변경을 원할 때만 선택 화면
  if (options.selectAccount) params.set("prompt", "select_account");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = params.toString();
  return url;
}

async function postForm(url: string, fields: Record<string, string | undefined>) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) if (value) body.set(key, value);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(`token request failed (${res.status}): ${JSON.stringify(json)}`);
  return json;
}

interface KakaoMe {
  id: number;
  properties?: { nickname?: string; thumbnail_image?: string };
  kakao_account?: {
    email?: string;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    profile?: { nickname?: string; thumbnail_image_url?: string; is_default_image?: boolean };
  };
}

const toHttps = (url: string) => url.replace(/^http:\/\//, "https://");

/** 인가 코드를 토큰으로 바꾸고 사용자 정보를 가져온다. */
export async function fetchProfile(
  provider: OAuthProvider,
  options: { code: string; redirectUri: string; codeVerifier?: string },
): Promise<OAuthProfile> {
  const creds = credentials(provider);
  if (!creds) throw new Error(`${provider} login is not configured`);

  if (provider === "kakao") {
    const token = await postForm("https://kauth.kakao.com/oauth/token", {
      grant_type: "authorization_code",
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      redirect_uri: options.redirectUri,
      code: options.code,
    });
    const res = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`kakao user/me failed (${res.status})`);
    const me = (await res.json()) as KakaoMe;
    const account = me.kakao_account ?? {};
    const profile = account.profile ?? {};
    return {
      providerUserId: String(me.id),
      name: profile.nickname || me.properties?.nickname || "카카오 사용자",
      // 확인된 이메일만 저장(이메일 동의는 선택 항목일 수 있다)
      email: account.email && account.is_email_valid && account.is_email_verified ? account.email : "",
      image: profile.is_default_image ? "" : toHttps(profile.thumbnail_image_url || me.properties?.thumbnail_image || ""),
    };
  }

  const token = await postForm("https://oauth2.googleapis.com/token", {
    grant_type: "authorization_code",
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    redirect_uri: options.redirectUri,
    code: options.code,
    code_verifier: options.codeVerifier,
  });
  if (typeof token.id_token !== "string") throw new Error("google token response has no id_token");
  return verifyGoogleIdToken(token.id_token);
}
