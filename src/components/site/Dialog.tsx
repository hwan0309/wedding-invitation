"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconClose } from "@/components/icons";

export function Dialog({
  open,
  title,
  onClose,
  children,
  size = "md",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`max-h-[90svh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl outline-none sm:rounded-3xl ${
          size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="rounded-full p-1.5 text-muted hover:bg-paper">
            <IconClose size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** 화면 아래에 잠깐 떠오르는 안내 메시지 */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = useCallback((text: string) => {
    clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);

  const node = message ? (
    <div
      role="status"
      className="pointer-events-none fixed bottom-8 left-1/2 z-[120] max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full bg-ink/90 px-5 py-3 text-center text-sm font-medium text-white shadow-lg"
    >
      {message}
    </div>
  ) : null;

  return { show, node };
}
