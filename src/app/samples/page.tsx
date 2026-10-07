import type { Metadata } from "next";
import Link from "next/link";
import { CoverThumb } from "@/components/site/Phone";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { FONTS, PALETTES, THEMES, getFont, getPalette } from "@/lib/invitation/themes";

export const metadata: Metadata = {
  title: "청첩장 샘플",
  description: `${THEMES.length}가지 모바일 청첩장 디자인을 실제 청첩장처럼 넘겨보세요.`,
};

export default function SamplesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <p className="text-[12px] font-semibold uppercase tracking-[0.32em] text-brand">Samples</p>
        <h1 className="mt-4 text-[30px] font-bold tracking-tight sm:text-[38px]">
          {THEMES.length}가지 청첩장 샘플
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
          디자인을 누르면 실제 청첩장처럼 끝까지 넘겨볼 수 있어요. 색상 {PALETTES.length}가지와 글꼴 {FONTS.length}
          가지는 만든 뒤에도 자유롭게 바꿀 수 있어요.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {THEMES.map((theme, i) => (
            <article key={theme.id}>
              <Link
                href={`/sample/${theme.id}`}
                className="block overflow-hidden rounded-2xl shadow-sm ring-1 ring-line transition hover:-translate-y-1 hover:shadow-xl"
              >
                <CoverThumb theme={theme.id} />
              </Link>
              <div className="mt-3.5 flex items-baseline gap-2">
                <span className="font-display text-[17px] font-semibold text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-bold">{theme.name}</h2>
              </div>
              <p className="mt-0.5 text-[13px] text-muted">{theme.description}</p>
              <p className="mt-1 text-[12px] text-muted">
                {getFont(theme.font).name} · {getPalette(theme.palette).name}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <Link
                  href={`/sample/${theme.id}`}
                  className="flex h-9 items-center justify-center rounded-lg border border-line text-[13px] font-semibold text-ink-soft transition hover:border-ink/30 hover:text-ink"
                >
                  미리보기
                </Link>
                <Link
                  href={`/create?theme=${theme.id}`}
                  className="flex h-9 items-center justify-center rounded-lg bg-ink text-[13px] font-semibold text-white transition hover:bg-black"
                >
                  만들기
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
