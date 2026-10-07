"use client";

import { useSyncExternalStore } from "react";
import { SITE } from "@/lib/config";

const noopSubscribe = () => () => {};

/** 현재 접속 주소(서버 렌더 중에는 설정값을 쓴다) */
export function useOrigin() {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => SITE.url,
  );
}

/** ISO 시각 → 한국 시간 "오후 3:42" (서버/클라이언트 결과가 같도록 직접 계산) */
export function formatKstTime(iso: string) {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "";
  const kst = new Date(time + 9 * 3_600_000);
  const h = kst.getUTCHours();
  const m = String(kst.getUTCMinutes()).padStart(2, "0");
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${m}`;
}

/** ISO 시각 → 한국 날짜 "2026.10.07" */
export function formatKstDate(iso: string) {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "";
  const kst = new Date(time + 9 * 3_600_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${kst.getUTCFullYear()}.${pad(kst.getUTCMonth() + 1)}.${pad(kst.getUTCDate())}`;
}
