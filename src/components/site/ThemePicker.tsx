"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { createInvitation, type ActionResult } from "@/app/actions";
import { IconCheck, IconChevronRight } from "@/components/icons";
import { isThemeId, THEMES } from "@/lib/invitation/themes";
import type { ThemeId } from "@/lib/invitation/types";
import { CoverThumb } from "./Phone";

export function ThemePickerWithParams() {
  const param = useSearchParams().get("theme");
  return <ThemePicker initial={isThemeId(param) ? param : "basic"} />;
}

export function ThemePicker({ initial = "basic" }: { initial?: ThemeId }) {
  const [selected, setSelected] = useState<ThemeId>(initial);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, form) => createInvitation(String(form.get("theme"))),
    null,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="theme" value={selected} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {THEMES.map((t) => {
          const active = selected === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              aria-pressed={active}
              className="text-left"
            >
              <span
                className={`relative block overflow-hidden rounded-2xl ring-2 transition ${
                  active ? "ring-brand shadow-lg shadow-brand/15" : "ring-line hover:ring-ink/20"
                }`}
              >
                <CoverThumb theme={t.id} />
                {active && (
                  <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-brand text-white shadow">
                    <IconCheck size={16} strokeWidth={2.6} />
                  </span>
                )}
              </span>
              <span className="mt-2.5 block font-bold">{t.name}</span>
              <span className="block text-[13px] text-muted">{t.description}</span>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-10 border-t border-line bg-white/90 py-4 backdrop-blur">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">{THEMES.find((t) => t.id === selected)?.name}</span> 테마 ·
            예시 내용이 채워진 상태로 시작해요
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-13 w-full items-center justify-center gap-1.5 rounded-2xl bg-brand px-8 py-3.5 text-[16px] font-bold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-deep disabled:opacity-60 sm:w-auto"
          >
            {pending ? "만드는 중…" : "이 디자인으로 시작하기"}
            {!pending && <IconChevronRight size={18} strokeWidth={2.2} />}
          </button>
        </div>
        {state && !state.ok && (
          <p className="mt-3 rounded-xl bg-brand-soft px-4 py-3 text-center text-sm text-brand-deep">
            {state.error}{" "}
            <Link href="/my" className="font-semibold underline">
              내 청첩장 관리하기
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
