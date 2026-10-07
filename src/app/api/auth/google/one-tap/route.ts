import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/constants";
import { verifyGoogleIdToken } from "@/lib/auth/google";
import { isProviderConfigured, randomToken } from "@/lib/auth/oauth";
import { signIn } from "@/lib/auth/sign-in";

// 구글 원탭(자동 로그인): 브라우저가 받은 ID 토큰을 서버에서 검증해 세션을 만든다.
const NONCE_COOKIE = "g_nonce";
const NONCE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth/google",
  maxAge: 60 * 10,
};

/** 원탭 시작 전에 일회용 nonce 발급(토큰 재사용 방지) */
export async function GET() {
  if (!isProviderConfigured("google")) return Response.json({ error: "not configured" }, { status: 404 });
  const nonce = randomToken(16);
  (await cookies()).set(NONCE_COOKIE, nonce, NONCE_OPTIONS);
  return Response.json({ nonce }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  // 다른 사이트에서 보낸 요청 차단
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { credential?: unknown; next?: unknown; remember?: unknown }
    | null;
  const credential = typeof body?.credential === "string" ? body.credential : "";

  const jar = await cookies();
  const nonce = jar.get(NONCE_COOKIE)?.value;
  jar.set(NONCE_COOKIE, "", { ...NONCE_OPTIONS, maxAge: 0 });
  if (!credential || !nonce) return Response.json({ error: "로그인 정보가 없어요." }, { status: 400 });

  try {
    const profile = await verifyGoogleIdToken(credential, nonce);
    await signIn("google", profile, body?.remember !== false);
  } catch (err) {
    console.error("[auth] google one-tap failed", err);
    return Response.json({ error: "Google 로그인을 확인하지 못했어요." }, { status: 401 });
  }
  return Response.json({ ok: true, next: safeNext(body?.next) });
}
