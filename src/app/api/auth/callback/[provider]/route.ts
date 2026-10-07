import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/constants";
import { fetchProfile, isOAuthProvider } from "@/lib/auth/oauth";
import { OAUTH_COOKIES, OAUTH_COOKIE_OPTIONS } from "@/lib/auth/oauth-cookies";
import { signIn } from "@/lib/auth/sign-in";

/** 카카오/구글에서 돌아오는 곳: state 확인 → 사용자 정보 조회 → 세션 시작 → 원래 가려던 페이지로 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/auth/callback/[provider]">) {
  const { provider } = await ctx.params;
  if (!isOAuthProvider(provider)) return new Response("Not found", { status: 404 });

  const jar = await cookies();
  const saved = {
    state: jar.get("oauth_state")?.value,
    verifier: jar.get("oauth_verifier")?.value,
    next: safeNext(jar.get("oauth_next")?.value),
    remember: jar.get("oauth_remember")?.value !== "0",
  };
  for (const name of OAUTH_COOKIES) jar.set(name, "", { ...OAUTH_COOKIE_OPTIONS, maxAge: 0 });

  const params = request.nextUrl.searchParams;
  const backToLogin = (error: string) => {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", error);
    url.searchParams.set("next", saved.next);
    return NextResponse.redirect(url);
  };

  // 사용자가 동의 화면에서 취소한 경우 등
  const providerError = params.get("error");
  if (providerError) return backToLogin(providerError === "access_denied" ? "cancelled" : "failed");

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state || !saved.state || state !== saved.state) return backToLogin("expired");

  try {
    const redirectUri = new URL(`/api/auth/callback/${provider}`, request.url).toString();
    const profile = await fetchProfile(provider, { code, redirectUri, codeVerifier: saved.verifier });
    await signIn(provider, profile, saved.remember);
  } catch (err) {
    console.error(`[auth] ${provider} login failed`, err);
    return backToLogin("failed");
  }

  return NextResponse.redirect(new URL(saved.next, request.url));
}
