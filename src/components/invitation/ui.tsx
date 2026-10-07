"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { IconClose } from "@/components/icons";
import { useInvitation } from "./context";

export const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).join(" ");

/**
 * 모달·라이트박스를 띄울 레이어. 청첩장 루트 안에 두기 때문에
 * 편집기 미리보기(휴대폰 프레임) 안에서는 프레임 기준으로, 실제 페이지에서는 화면 기준으로 뜬다.
 */
export const LayerContext = createContext<HTMLElement | null>(null);

export function Layer({ children }: { children: ReactNode }) {
  const layer = useContext(LayerContext);
  return layer ? createPortal(children, layer) : null;
}

/** 실제 청첩장에서 모달이 열리면 뒤쪽 페이지 스크롤을 막는다. */
function useScrollLock(active: boolean) {
  const { mode } = useInvitation();
  useEffect(() => {
    if (!active || mode !== "live") return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [active, mode]);
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <Layer>
      <div
        className="inv-modal"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          ref={panelRef}
          className="inv-modal__panel"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
        >
          <div className="inv-modal__head">
            <strong>{title}</strong>
            <button type="button" aria-label="닫기" onClick={onClose}>
              <IconClose size={22} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </Layer>
  );
}

export function SectionTitle({ en, ko }: { en: string; ko: string }) {
  return (
    <header className="inv-title">
      <p className="inv-title__en">{en}</p>
      <h2 className="inv-title__ko">{ko}</h2>
    </header>
  );
}

/** 스크롤해서 화면에 들어올 때 살짝 떠오르는 효과 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={cx("inv-reveal", visible && "is-visible", className)}>
      {children}
    </div>
  );
}

/** Unsplash 사진은 화면 크기에 맞는 해상도를 고를 수 있게 srcset을 만든다. */
function unsplashSrcSet(src: string) {
  if (!src.startsWith("https://images.unsplash.com/")) return undefined;
  const url = new URL(src);
  const ratio = Number(url.searchParams.get("h")) / Number(url.searchParams.get("w"));
  return [480, 828, 1200]
    .map((w) => {
      url.searchParams.set("w", String(w));
      if (ratio) url.searchParams.set("h", String(Math.round(w * ratio)));
      return `${url} ${w}w`;
    })
    .join(", ");
}

export function Photo({
  src,
  className,
  alt = "",
  eager,
}: {
  src: string;
  className?: string;
  alt?: string;
  eager?: boolean;
}) {
  const { thumbnail } = useInvitation();
  if (!src) {
    return <div className={cx("inv-photo-empty", className)} aria-hidden />;
  }
  const srcSet = unsplashSrcSet(src);
  return (
    // 사용자가 올린 임의 크기의 사진이라 next/image 대신 일반 img를 쓴다.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? "(max-width: 480px) 100vw, 480px" : undefined}
      alt={alt}
      className={className}
      loading={eager && !thumbnail ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}
