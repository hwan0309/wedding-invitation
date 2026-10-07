"use client";

import { useEffect, useState } from "react";

export interface HeroSlide {
  /** 세로 화면(모바일)용 */
  mobile: string;
  /** 가로 화면(데스크톱)용 */
  desktop: string;
}

/** 첫 화면 배경: 웨딩 사진이 천천히 확대되며 서로 겹쳐 바뀐다. */
export function HeroSlideshow({ slides, interval = 6000 }: { slides: HeroSlide[]; interval?: number }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(timer);
  }, [slides.length, interval]);

  return (
    <div className="absolute inset-0 -z-10 bg-ink" aria-hidden>
      {slides.map((slide, i) => (
        <picture key={slide.desktop} className={`hero-slide ${i === active ? "is-active" : ""}`}>
          <source media="(min-width: 768px)" srcSet={slide.desktop} />
          <img
            src={slide.mobile}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
          />
        </picture>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/60" />
    </div>
  );
}
