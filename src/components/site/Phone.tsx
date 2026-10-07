"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { InvitationView } from "@/components/invitation/InvitationView";
import { createSampleData } from "@/lib/invitation/defaults";
import type { InvitationData, ThemeId } from "@/lib/invitation/types";

export function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`phone ${className}`}>
      <div className="phone__screen">
        <div className="phone__notch" aria-hidden />
        <div className="phone__scroll">{children}</div>
      </div>
    </div>
  );
}

const BASE_WIDTH = 390;
const BASE_HEIGHT = 560;

/**
 * 청첩장 커버를 카드 크기에 맞게 축소해서 보여준다(테마 썸네일).
 * width를 주면 그 크기로 고정해 서버 렌더링 때부터 보이고, 없으면 부모 폭에 맞춰 잰다.
 */
export function CoverThumb({
  theme,
  data,
  width,
  className = "",
}: {
  theme?: ThemeId;
  data?: InvitationData;
  width?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(0);
  const [sample] = useState(() => data ?? createSampleData(theme));
  const scale = width ? width / BASE_WIDTH : measured;

  useEffect(() => {
    const el = ref.current;
    if (!el || width) return;
    const observer = new ResizeObserver(([entry]) =>
      setMeasured(entry.contentRect.width / BASE_WIDTH),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden bg-cream ${className}`}
      style={{ aspectRatio: `${BASE_WIDTH} / ${BASE_HEIGHT}`, width }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          containerType: "size",
          transform: `scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        <InvitationView data={data ?? sample} mode="sample" coverOnly />
      </div>
    </div>
  );
}
