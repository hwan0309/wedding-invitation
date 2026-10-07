"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconClose } from "@/components/icons";
import { useInvitation } from "../context";
import { Layer, Photo, Reveal, SectionTitle, cx } from "../ui";

/** 가로 스크롤 스냅 트랙의 현재 인덱스 추적 + 이동 */
function useSnapTrack(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (i: number, smooth = true) => {
    const el = ref.current;
    if (!el) return;
    const next = (i + count) % count;
    el.scrollTo({ left: next * el.clientWidth, behavior: smooth ? "smooth" : "instant" });
  };
  return { ref, index: Math.min(index, count - 1), go };
}

function Lightbox({
  images,
  start,
  onClose,
}: {
  images: string[];
  start: number;
  onClose: () => void;
}) {
  const { data, mode } = useInvitation();
  const { ref, index, go } = useSnapTrack(images.length);

  const jumpToStart = useEffectEvent(() => go(start, false));
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
  });

  useEffect(() => {
    jumpToStart();
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (mode !== "live") return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [mode]);

  return (
    <div
      className={cx("inv-lightbox", data.gallery.preventZoom && "is-locked")}
      role="dialog"
      aria-modal="true"
      aria-label="사진 크게 보기"
      onContextMenu={data.gallery.preventZoom ? (e) => e.preventDefault() : undefined}
    >
      <div className="inv-lightbox__bar">
        <span>
          {index + 1} / {images.length}
        </span>
        <button type="button" aria-label="닫기" onClick={onClose}>
          <IconClose size={24} />
        </button>
      </div>
      <div ref={ref} className="inv-lightbox__track">
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="inv-lightbox__slide">
            <Photo src={src} alt={`갤러리 사진 ${i + 1}`} />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button type="button" className="inv-lightbox__nav is-prev" aria-label="이전 사진" onClick={() => go(index - 1)}>
            <IconChevronLeft size={28} />
          </button>
          <button type="button" className="inv-lightbox__nav is-next" aria-label="다음 사진" onClick={() => go(index + 1)}>
            <IconChevronRight size={28} />
          </button>
        </>
      )}
    </div>
  );
}

function SlideGallery({ images, onOpen }: { images: string[]; onOpen: (i: number) => void }) {
  const { ref, index, go } = useSnapTrack(images.length);
  return (
    <div className="inv-slide">
      <div className="inv-slide__viewport">
        <div ref={ref} className="inv-slide__track">
          {images.map((src, i) => (
            <button key={`${src}-${i}`} type="button" className="inv-slide__item" onClick={() => onOpen(i)}>
              <Photo src={src} alt={`갤러리 사진 ${i + 1}`} />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button type="button" className="inv-slide__nav is-prev" aria-label="이전 사진" onClick={() => go(index - 1)}>
              <IconChevronLeft size={22} />
            </button>
            <button type="button" className="inv-slide__nav is-next" aria-label="다음 사진" onClick={() => go(index + 1)}>
              <IconChevronRight size={22} />
            </button>
          </>
        )}
      </div>
      <p className="inv-slide__count">
        {index + 1} / {images.length}
      </p>
      <div className="inv-slide__thumbs">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            className={cx("inv-slide__thumb", i === index && "is-active")}
            aria-label={`${i + 1}번째 사진 보기`}
            onClick={() => go(i)}
          >
            <Photo src={src} />
          </button>
        ))}
      </div>
    </div>
  );
}

function GridGallery({ images, onOpen }: { images: string[]; onOpen: (i: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? images : images.slice(0, 9);
  return (
    <div className="inv-grid">
      <div className="inv-grid__items">
        {visible.map((src, i) => (
          <button key={`${src}-${i}`} type="button" onClick={() => onOpen(i)}>
            <Photo src={src} alt={`갤러리 사진 ${i + 1}`} />
          </button>
        ))}
      </div>
      {images.length > 9 && (
        <button type="button" className="inv-btn inv-btn--line" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "접기" : `사진 더보기 (${images.length - 9})`}
        </button>
      )}
    </div>
  );
}

export function Gallery() {
  const { data } = useInvitation();
  const [open, setOpen] = useState<number | null>(null);
  const images = data.gallery.images;

  return (
    <section className="inv-section inv-gallery">
      <Reveal>
        <SectionTitle en="Gallery" ko="우리의 순간" />
      </Reveal>
      <Reveal>
        {data.gallery.layout === "grid" ? (
          <GridGallery images={images} onOpen={setOpen} />
        ) : (
          <SlideGallery images={images} onOpen={setOpen} />
        )}
      </Reveal>
      {open !== null && (
        <Layer>
          <Lightbox images={images} start={open} onClose={() => setOpen(null)} />
        </Layer>
      )}
    </section>
  );
}
