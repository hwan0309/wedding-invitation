// 로그인 진행 중에만 잠깐 쓰는 쿠키(동의 화면 → 콜백 사이 10분)
export const OAUTH_COOKIES = ["oauth_state", "oauth_verifier", "oauth_next", "oauth_remember"] as const;

export const OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/auth",
  maxAge: 60 * 10,
};
