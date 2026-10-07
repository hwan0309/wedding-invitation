"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import type { InvitationData, ViewMode } from "@/lib/invitation/types";

interface InvitationContextValue {
  data: InvitationData;
  mode: ViewMode;
  /** 실제 청첩장에서만 존재(방명록·참석 의사 API 호출용) */
  invitationId: string | null;
  /** 축소된 커버 썸네일로 그리는 중(사진을 지연 로딩) */
  thumbnail: boolean;
  toast: (message: string) => void;
}

export const InvitationContext = createContext<InvitationContextValue | null>(null);

export function useInvitation() {
  const ctx = useContext(InvitationContext);
  if (!ctx) throw new Error("InvitationContext missing");
  return ctx;
}

const noopSubscribe = () => () => {};

/** 하이드레이션이 끝난 뒤에만 true (서버 렌더 결과와 어긋나지 않게) */
export const useHydrated = () =>
  useSyncExternalStore(noopSubscribe, () => true, () => false);

/**
 * 현재 시각(intervalMs 단위로 갱신). 서버에서는 null.
 * Cache Components는 프리렌더 중 Date.now() 사용을 막기 때문에 클라이언트에서만 읽는다.
 */
export function useNow(intervalMs = 60_000) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const timer = setInterval(onChange, intervalMs);
      return () => clearInterval(timer);
    },
    [intervalMs],
  );
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => null,
  );
}

/** localStorage 값을 읽는다(서버·저장소 차단 환경에서는 null). */
export function useStoredFlag(key: string) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}
