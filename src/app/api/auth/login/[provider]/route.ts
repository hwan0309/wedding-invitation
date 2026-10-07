import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/constants";
import {
  authorizationUrl,
  isOAuthProvider,
  isProviderConfigured,
  randomToken,
} from "@/lib/auth/oauth";
import { OAUTH_COOKIE_OPTIONS } from "@/lib/auth/oauth-cookies";
import { signIn } from "@/lib/auth/sign-in";

/** 로그인 시작: state(CSRF 방지)·PKCE 값을 쿠키에 담고 카카오/구글 동의 화면으로 보낸다. */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/auth/login/[provider]">) {
  const { provider } = await ctx.params;
  const params = request.nextUrl.searchParams;
  const next = safeNext(params.get("next"));
  const remember = params.get("remember") !== "0";

  // 개발 모드 전용 테스트 계정(카카오/구글 앱을 등록하기 전에 전체 흐름을 확인하는 용도)
  if (provider === "dev") {
    if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
    await signIn("dev", { providerUserId: "local-dev", name: "테스트 사용자", email: "dev@localhost", image: "" }, remember);
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (!isOAuthProvider(provider)) return new Response("Not found", { status: 404 });
  if (!isProviderConfigured(provider)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "not_configured");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  const state = randomToken();
  const codeVerifier = randomToken();
  const jar = await cookies();
  jar.set("oauth_state", state, OAUTH_COOKIE_OPTIONS);
  jar.set("oauth_verifier", codeVerifier, OAUTH_COOKIE_OPTIONS);
  jar.set("oauth_next", next, OAUTH_COOKIE_OPTIONS);
  jar.set("oauth_remember", remember ? "1" : "0", OAUTH_COOKIE_OPTIONS);

  const redirectUri = new URL(`/api/auth/callback/${provider}`, request.url).toString();
  return NextResponse.redirect(
    authorizationUrl(provider, {
      redirectUri,
      state,
      codeVerifier,
      selectAccount: params.get("switch") === "1",
    }),
  );
}
