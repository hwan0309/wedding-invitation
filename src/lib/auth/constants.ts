// 인증 관련 공용 상수/유틸(서버·proxy 공용, 비밀값 없음)

export const SESSION_COOKIE = "session";
/** 로그아웃 직후 구글 원탭이 바로 다시 로그인시키지 않도록 표시 */
export const ONE_TAP_OFF_COOKIE = "one_tap_off";

const DAY = 24 * 60 * 60 * 1000;
/** 자동 로그인: 30일, 사용할 때마다 다시 30일로 연장 */
export const PERSISTENT_SESSION_MS = 30 * DAY;
/** 자동 로그인 해제: 브라우저를 닫으면 끝(서버 기준으로도 최대 12시간) */
export const BROWSER_SESSION_MS = 12 * 60 * 60 * 1000;
/** 남은 기간이 이보다 짧아지면 연장 */
export const SESSION_RENEW_BEFORE_MS = 15 * DAY;

/**
 * 세션 토큰 앞에 붙는 표시. proxy가 저장소 조회 없이 쿠키 만료를 연장할지 판단하는 데 쓴다.
 * (실제 만료 판단은 항상 저장소 기준이라 조작돼도 보안에는 영향이 없다)
 */
export const PERSISTENT_TOKEN_PREFIX = "p.";

/** 로그인 후 돌아갈 주소. 다른 사이트로 보내는 오픈 리다이렉트를 막는다. */
export function safeNext(value: unknown, fallback = "/my") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "http://local.invalid");
    if (url.origin !== "http://local.invalid") return fallback;
    if (url.pathname.startsWith("/login") || url.pathname.startsWith("/api/")) return fallback;
    return (url.pathname + url.search).slice(0, 512);
  } catch {
    return fallback;
  }
}
