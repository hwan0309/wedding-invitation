"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";
import { THEMES } from "@/lib/invitation/themes";
import { CoverThumb } from "./Phone";

const CARD_WIDTH = 250;

/** 가운데 카드가 크게, 양옆은 작게 보이는 샘플 넘겨보기 */
export function SampleCarousel() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const dragStart = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const count = THEMES.length;
  const current = THEMES[index];

  const go = (i: number) => setIndex(((i % count) + count) % count);

  return (
    <div>
      <div
        className="relative mx-auto h-[400px] max-w-5xl touch-pan-y select-none sm:h-[430px]"
        style={{ perspective: "1400px" }}
        role="region"
        aria-roledescription="carousel"
        aria-label="청첩장 샘플"
        onPointerDown={(e) => {
          dragStart.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (dragStart.current === null) return;
          const dx = e.clientX - dragStart.current;
          dragStart.current = null;
          if (Math.abs(dx) > 40) {
            suppressClick.current = true;
            go(index + (dx < 0 ? 1 : -1));
            setTimeout(() => (suppressClick.current = false), 0);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(index - 1);
          if (e.key === "ArrowRight") go(index + 1);
        }}
      >
        {THEMES.map((theme, i) => {
          let offset = i - index;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const distance = Math.abs(offset);
          const visible = distance <= 2;
          return (
            <button
              key={theme.id}
              type="button"
              tabIndex={offset === 0 ? 0 : -1}
              aria-label={offset === 0 ? `${theme.name} 샘플 미리보기` : `${theme.name} 샘플로 넘기기`}
              onClick={() => {
                if (suppressClick.current) return;
                if (offset === 0) router.push(`/sample/${theme.id}`);
                else go(i);
              }}
              className="absolute left-1/2 top-3 transition-[transform,opacity] duration-500 ease-out"
              style={{
                width: CARD_WIDTH,
                marginLeft: -CARD_WIDTH / 2,
                transform: `translateX(${offset * 60}%) scale(${1 - distance * 0.13}) rotateY(${offset * -9}deg)`,
                zIndex: 20 - distance,
                opacity: visible ? 1 - distance * 0.2 : 0,
                pointerEvents: visible ? "auto" : "none",
              }}
            >
              <span className="block overflow-hidden rounded-[22px] bg-white shadow-[0_26px_50px_-24px_rgba(60,40,20,0.55)] ring-1 ring-black/5">
                <CoverThumb theme={theme.id} width={CARD_WIDTH} />
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="이전 샘플"
          className="absolute left-2 top-[45%] z-30 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-lg backdrop-blur hover:bg-white sm:left-6"
        >
          <IconChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="다음 샘플"
          className="absolute right-2 top-[45%] z-30 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink shadow-lg backdrop-blur hover:bg-white sm:right-6"
        >
          <IconChevronRight size={20} />
        </button>
      </div>

      <div className="mt-6 flex justify-center gap-1.5" aria-hidden>
        {THEMES.map((theme, i) => (
          <span
            key={theme.id}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-brand" : "w-1.5 bg-ink/15"}`}
          />
        ))}
      </div>

      <div className="mt-6 text-center" aria-live="polite">
        <p className="text-lg font-bold">
          {String(index + 1).padStart(2, "0")} · {current.name}
        </p>
        <p className="mt-1 text-sm text-muted">{current.description}</p>
      </div>

      <div className="mt-7 flex justify-center gap-2.5">
        <Link
          href={`/sample/${current.id}`}
          className="inline-flex h-12 items-center gap-1 rounded-full bg-ink px-6 text-[15px] font-semibold text-white transition hover:bg-black"
        >
          이 샘플 미리보기 <IconChevronRight size={16} />
        </Link>
        <Link
          href="/samples"
          className="inline-flex h-12 items-center gap-1 rounded-full border border-line bg-white px-6 text-[15px] font-semibold text-ink transition hover:border-ink/30"
        >
          샘플 전체 보기 <IconChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
