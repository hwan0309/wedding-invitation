import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/SiteChrome";
import { ThemePicker, ThemePickerWithParams } from "@/components/site/ThemePicker";
import { LIMITS } from "@/lib/config";

export const metadata: Metadata = { title: "청첩장 만들기" };

export default function CreatePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-brand">Step 1 · 디자인 고르기</p>
        <h1 className="mt-3 text-[28px] font-bold tracking-tight sm:text-[36px]">어떤 분위기로 시작할까요?</h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
          디자인은 만든 뒤에도 언제든 바꿀 수 있어요. 예시 내용이 채워진 채로 시작하니 고치기만 하면 돼요.
          <span className="ml-1 font-medium text-ink">
            청첩장은 {LIMITS.invitationsPerOwner}개까지 만들 수 있어요.
          </span>
        </p>
        <div className="mt-10">
          <Suspense fallback={<ThemePicker />}>
            <ThemePickerWithParams />
          </Suspense>
        </div>
      </main>
    </>
  );
}
