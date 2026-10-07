"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { IconPause, IconPlay } from "@/components/icons";

export interface HeroVideoSource {
  /** 휴대폰용(가벼운 해상도) */
  mobile: string;
  /** PC용 */
  desktop: string;
  /** 영상이 준비되기 전·영상을 틀지 않을 때 보이는 이미지 */
  poster: string;
}

function useMediaQuery(query: string, serverValue: boolean) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => serverValue);
}

const noopSubscribe = () => () => {};

/** 데이터 절약 모드(모바일 브라우저 설정)면 영상을 받지 않는다. */
function useSaveData() {
  return useSyncExternalStore(
    noopSubscribe,
    () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData),
    () => true,
  );
}

/**
 * 첫 화면 배경 영상. 서버에서는 포스터 이미지만 그리고,
 * 브라우저에서 화면 크기에 맞는 영상을 골라 소리 없이 반복 재생한다.
 */
export function HeroVideo({ video }: { video: HeroVideoSource }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const desktop = useMediaQuery("(min-width: 768px)", false);
  const saveData = useSaveData();
  const [playingSrc, setPlayingSrc] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  const src = reduceMotion || saveData ? null : desktop ? video.desktop : video.mobile;

  // iOS는 muted 속성이 확실히 붙어 있어야 자동 재생된다.
  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;
    el.muted = true;
    el.play().catch(() => setPaused(true));
  }, [src]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => undefined);
    else el.pause();
  };

  return (
    <>
      <div className="absolute inset-0 -z-10 bg-ink" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.poster} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        {src && (
          <video
            key={src}
            ref={ref}
            src={src}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            onPlaying={() => {
              setPlayingSrc(src);
              setPaused(false);
            }}
            onPause={() => setPaused(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              playingSrc === src ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>
      {src && (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? "배경 영상 재생" : "배경 영상 일시정지"}
          className="absolute bottom-6 right-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white backdrop-blur transition hover:bg-black/50"
        >
          {paused ? <IconPlay size={15} /> : <IconPause size={15} />}
        </button>
      )}
    </>
  );
}
