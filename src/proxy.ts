import { NextResponse, type NextRequest } from "next/server";
import {
  PERSISTENT_SESSION_MS,
  PERSISTENT_TOKEN_PREFIX,
  SESSION_COOKIE,
} from "@/lib/auth/constants";

// 로그인이 필요한 화면. 여기서는 쿠키가 있는지만 빠르게 보고(낙관적 확인),
// 진짜 세션 검증은 각 페이지·서버 액션·API에서 저장소 기준으로 다시 한다.
const PROTECTED = [/^\/create(\/|$)/, /^\/edit\//, /^\/my(\/|$)/];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token && PROTECTED.some((pattern) => pattern.test(pathname))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  // 자동 로그인: 사이트를 쓸 때마다 브라우저 쿠키 만료를 다시 30일로 연장
  if (token?.startsWith(PERSISTENT_TOKEN_PREFIX) && request.method === "GET") {
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: PERSISTENT_SESSION_MS / 1000,
    });
  }
  return response;
}

export const config = {
  // API·정적 파일·하객용 청첩장(/i/…)은 건너뛴다.
  matcher: ["/((?!api/|_next/|i/|samples/|favicon.ico).*)"],
};
