import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { IconCheck } from "@/components/icons";
import { CoverThumb } from "@/components/site/Phone";
import { Logo } from "@/components/site/SiteChrome";
import { ONE_TAP_OFF_COOKIE, safeNext } from "@/lib/auth/constants";
import { isProviderConfigured } from "@/lib/auth/oauth";
import { getCurrentUser } from "@/lib/auth/session";
import { SITE } from "@/lib/config";

export const metadata: Metadata = { title: "로그인", robots: { index: false } };

const PROMISES = [
  "휴대폰 · PC 어디서든 이어서 수정",
  "수정해도 링크와 QR 코드는 그대로",
  "12가지 디자인 · 모든 기능 기본 제공",
];

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-cream lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-brand-soft blur-3xl" aria-hidden />
      <Logo className="relative" />
      <div className="relative">
        <h2 className="text-[34px] font-bold leading-snug tracking-tight">
          로그인하면 청첩장이
          <br />
          계정에 안전하게 저장돼요
        </h2>
        <ul className="mt-8 space-y-3">
          {PROMISES.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-[16px] text-ink-soft">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-free shadow-sm">
                <IconCheck size={14} strokeWidth={2.6} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative flex h-[300px] items-end justify-center" aria-hidden>
        {(
          [
            ["arch", "-rotate-[9deg] translate-x-24 translate-y-4"],
            ["lettering", "rotate-[8deg] -translate-x-24 translate-y-6"],
            ["basic", "z-10 -translate-y-2"],
          ] as const
        ).map(([theme, transform]) => (
          <div key={theme} className={`absolute overflow-hidden rounded-2xl shadow-2xl shadow-black/15 ring-4 ring-white ${transform}`}>
            <CoverThumb theme={theme} width={176} />
          </div>
        ))}
      </div>
    </aside>
  );
}

function LoginPanelSkeleton() {
  return (
    <div className="w-full max-w-[380px] animate-pulse" aria-hidden>
      <div className="h-4 w-20 rounded bg-paper" />
      <div className="mt-4 h-8 w-64 rounded bg-paper" />
      <div className="mt-2 h-8 w-52 rounded bg-paper" />
      <div className="mt-10 h-[52px] rounded-xl bg-[#FEE500]/50" />
      <div className="mt-2.5 h-[52px] rounded-xl bg-paper" />
    </div>
  );
}

async function LoginContent({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const [params, user, jar] = await Promise.all([searchParams, getCurrentUser(), cookies()]);
  const next = safeNext(params.next);
  // 이미 로그인돼 있으면 바로 원래 가려던 곳으로
  if (user) redirect(next);

  const google = isProviderConfigured("google");
  return (
    <LoginPanel
      next={next}
      error={typeof params.error === "string" ? params.error : null}
      providers={{ kakao: isProviderConfigured("kakao"), google }}
      devMode={process.env.NODE_ENV !== "production"}
      googleClientId={google ? (process.env.GOOGLE_CLIENT_ID ?? null) : null}
      oneTapAutoSelect={!jar.get(ONE_TAP_OFF_COOKIE)}
    />
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="min-h-svh bg-white lg:grid lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />
      <section className="flex min-h-svh flex-col px-5 py-6 sm:px-10">
        <Logo className="lg:hidden" />
        <div className="flex flex-1 items-center justify-center py-12">
          <Suspense fallback={<LoginPanelSkeleton />}>
            <LoginContent searchParams={searchParams} />
          </Suspense>
        </div>
        <p className="text-center text-[12px] text-muted">
          © {SITE.name} · {SITE.tagline}
        </p>
      </section>
    </main>
  );
}
