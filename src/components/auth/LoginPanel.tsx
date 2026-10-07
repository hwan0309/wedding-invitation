"use client";

import { useState, type MouseEvent } from "react";
import { copyText } from "@/components/invitation/context";
import { IconInfo } from "@/components/icons";
import { GoogleLogo, KakaoSymbol } from "./bits";
import { GoogleOneTap } from "./GoogleOneTap";
import { openInExternalBrowser, useInAppBrowser } from "./inapp";

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: "로그인을 취소했어요.",
  expired: "로그인 시간이 지났어요. 다시 시도해 주세요.",
  failed: "로그인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
  not_configured: "아직 이 로그인 방법이 준비되지 않았어요.",
};

export interface LoginPanelProps {
  next: string;
  error: string | null;
  providers: { kakao: boolean; google: boolean };
  /** 개발 모드에서만: 테스트 계정 로그인 + 설정 안내 표시 */
  devMode: boolean;
  googleClientId: string | null;
  oneTapAutoSelect: boolean;
}

const buttonBase =
  "flex h-[52px] w-full items-center justify-center gap-2.5 rounded-xl text-[15px] font-semibold transition active:scale-[0.99]";

export function LoginPanel({ next, error, providers, devMode, googleClientId, oneTapAutoSelect }: LoginPanelProps) {
  const [remember, setRemember] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [oneTapError, setOneTapError] = useState<string | null>(null);
  const inApp = useInAppBrowser();

  const href = (provider: string, extra: Record<string, string> = {}) =>
    `/api/auth/login/${provider}?${new URLSearchParams({ next, remember: remember ? "1" : "0", ...extra })}`;

  // 구글은 카카오톡 등 앱 안 브라우저에서 로그인을 막는다 → 외부 브라우저로 안내
  const guardGoogle = (e: MouseEvent) => {
    if (!inApp) return;
    e.preventDefault();
    if (!openInExternalBrowser(inApp)) {
      setNotice("구글 로그인은 앱 안의 브라우저에서는 막혀 있어요. 오른쪽 위(또는 아래) 메뉴에서 ‘Safari로 열기’를 눌러 주세요.");
    }
  };

  const errorMessage = oneTapError ?? (error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.failed) : null);

  return (
    <div className="w-full max-w-[380px]">
      <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-brand">시작하기</p>
      <h1 className="mt-3 text-[28px] font-bold leading-snug tracking-tight">
        3초 만에 로그인하고
        <br />
        청첩장을 만들어 보세요
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        카카오나 Google 계정으로 바로 시작해요. 별도 회원가입 절차는 없어요.
      </p>

      {errorMessage && (
        <p role="alert" className="mt-6 rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand-deep">
          {errorMessage}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-2.5">
        <a href={href("kakao")} className={`${buttonBase} bg-[#FEE500] text-black/85 hover:brightness-[0.97]`}>
          <KakaoSymbol />
          카카오로 시작하기
        </a>
        <a
          href={href("google")}
          onClick={guardGoogle}
          className={`${buttonBase} border border-[#dadce0] bg-white text-[#1f1f1f] hover:bg-[#f8f9fa]`}
        >
          <GoogleLogo />
          Google 계정으로 계속하기
        </a>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-[18px] w-[18px] accent-brand"
          />
          자동 로그인
        </label>
        <a href={href("google", { switch: "1" })} onClick={guardGoogle} className="text-[13px] text-muted underline-offset-2 hover:text-ink hover:underline">
          다른 Google 계정으로 로그인
        </a>
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
        {remember
          ? "30일 동안 로그인 상태가 유지되고, 사이트를 쓸 때마다 기간이 연장돼요. 공용 PC에서는 체크를 해제하세요."
          : "브라우저를 닫으면 로그아웃돼요."}
      </p>

      {inApp && (
        <div className="mt-5 flex gap-2.5 rounded-xl bg-paper px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
          <IconInfo size={18} className="mt-0.5 shrink-0 text-muted" />
          <div>
            {notice ?? (
              <>
                {inApp === "kakaotalk" ? "카카오톡" : "앱"} 안에서 열었어요. 카카오 로그인은 바로 되고, 구글 로그인은 외부 브라우저에서
                진행돼요.
              </>
            )}
            {inApp === "ios" && (
              <button
                type="button"
                className="ml-1 font-semibold text-brand"
                onClick={async () => setNotice((await copyText(window.location.href)) ? "링크를 복사했어요. Safari에 붙여넣어 열어 주세요." : notice)}
              >
                링크 복사
              </button>
            )}
          </div>
        </div>
      )}

      {devMode && (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/20 p-4">
          <p className="text-[12px] font-bold uppercase tracking-wider text-muted">개발 모드에서만 보여요</p>
          <a
            href={href("dev")}
            className="mt-2.5 flex h-11 items-center justify-center rounded-xl bg-ink text-sm font-semibold text-white hover:bg-black"
          >
            테스트 계정으로 로그인
          </a>
          {(!providers.kakao || !providers.google) && (
            <p className="mt-3 text-[12px] leading-relaxed text-muted">
              {!providers.kakao && "카카오(KAKAO_CLIENT_ID) "}
              {!providers.google && "Google(GOOGLE_CLIENT_ID · GOOGLE_CLIENT_SECRET) "}
              키가 아직 없어요. <code className="rounded bg-paper px-1">.env.local</code>에 넣으면 실제 로그인이 동작해요.
              설정 방법은 README를 참고하세요.
            </p>
          )}
        </div>
      )}

      {googleClientId && !inApp && (
        <GoogleOneTap
          clientId={googleClientId}
          next={next}
          remember={remember}
          autoSelect={oneTapAutoSelect}
          onError={setOneTapError}
        />
      )}
    </div>
  );
}
