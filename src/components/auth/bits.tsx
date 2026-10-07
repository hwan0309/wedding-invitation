import { PROVIDER_LABEL, type CurrentUser, type LoginProvider } from "@/lib/auth/types";

/** 프로필 사진(없으면 이름 첫 글자) */
export function Avatar({ user, size = 32 }: { user: Pick<CurrentUser, "name" | "image">; size?: number }) {
  if (user.image) {
    return (
      // 소셜 프로필 이미지(외부 주소)라 next/image 대신 img. 구글 이미지는 referrer가 있으면 막히기도 한다.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt=""
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="shrink-0 rounded-full object-cover ring-1 ring-black/5"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full bg-brand-soft font-bold text-brand"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {user.name.trim().charAt(0) || "?"}
    </span>
  );
}

export function ProviderBadge({ provider }: { provider: LoginProvider }) {
  const style =
    provider === "kakao"
      ? "bg-[#FEE500] text-black/85"
      : provider === "google"
        ? "bg-white text-ink-soft ring-1 ring-line"
        : "bg-paper text-muted";
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${style}`}>
      {PROVIDER_LABEL[provider]}
    </span>
  );
}

/** 카카오 로그인 버튼 심볼(말풍선) */
export function KakaoSymbol({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#000"
        d="M12 3.6c-5.3 0-9.6 3.4-9.6 7.6 0 2.7 1.8 5.1 4.5 6.4l-1 3.6c-.1.3.3.6.6.4l4.2-2.8c.4 0 .9.1 1.3.1 5.3 0 9.6-3.4 9.6-7.7S17.3 3.6 12 3.6z"
      />
    </svg>
  );
}

/** Google 'G' 로고(브랜드 가이드 색상) */
export function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
