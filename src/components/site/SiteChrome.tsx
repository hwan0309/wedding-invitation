import Link from "next/link";
import { Suspense } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { getCurrentUser } from "@/lib/auth/session";
import { SITE } from "@/lib/config";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-baseline gap-1.5 ${className}`} aria-label={`${SITE.name} 홈`}>
      <span className="font-display text-[28px] font-semibold italic leading-none tracking-tight text-ink">
        {SITE.nameEn}
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
    </Link>
  );
}

/** 로그인 상태는 요청마다 달라서 따로 스트리밍한다(헤더의 나머지는 정적으로 미리 렌더링). */
async function UserNav() {
  const user = await getCurrentUser();
  if (user) return <UserMenu user={user} />;
  return (
    <Link href="/login" className="rounded-full px-3 py-2 hover:text-ink">
      로그인
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-0.5 text-[15px] text-ink-soft sm:gap-1">
          <Link href="/samples" className="hidden rounded-full px-3 py-2 hover:text-ink md:block">
            샘플 보기
          </Link>
          <Link href="/#faq" className="hidden rounded-full px-3 py-2 hover:text-ink md:block">
            자주 묻는 질문
          </Link>
          <Link href="/my" className="hidden rounded-full px-3 py-2 hover:text-ink sm:block">
            내 청첩장
          </Link>
          <Suspense fallback={<span className="mx-2 h-8 w-8 rounded-full bg-paper" aria-hidden />}>
            <UserNav />
          </Suspense>
          <Link
            href="/create"
            className="ml-1 shrink-0 rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-black"
          >
            청첩장 만들기
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted">{SITE.tagline}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-ink-soft sm:items-end">
          <div className="flex gap-4">
            <Link href="/samples" className="hover:text-ink">샘플</Link>
            <Link href="/#faq" className="hover:text-ink">자주 묻는 질문</Link>
            <Link href="/my" className="hover:text-ink">내 청첩장</Link>
          </div>
          <p className="text-xs text-muted">© {SITE.name}</p>
        </div>
      </div>
    </footer>
  );
}
