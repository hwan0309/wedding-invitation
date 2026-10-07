"use client";

import { useSyncExternalStore } from "react";

export type InAppBrowser = "kakaotalk" | "android" | "ios" | null;

/**
 * 카카오톡·인스타그램 등 앱 안의 브라우저 감지.
 * 구글은 앱 내장 브라우저(WebView)에서의 로그인을 막기 때문에(403 disallowed_useragent) 외부 브라우저로 안내해야 한다.
 */
export function detectInAppBrowser(ua: string): InAppBrowser {
  if (/KAKAOTALK/i.test(ua)) return "kakaotalk";
  if (!/FBAN|FBAV|Instagram|Line\/|NAVER\(inapp|DaumApps|everytimeApp|Snapchat|; wv\)/i.test(ua)) return null;
  return /Android/i.test(ua) ? "android" : "ios";
}

const noopSubscribe = () => () => {};

export function useInAppBrowser(): InAppBrowser {
  return useSyncExternalStore(
    noopSubscribe,
    () => detectInAppBrowser(navigator.userAgent),
    () => null,
  );
}

/** 지금 페이지를 기기의 기본 브라우저로 다시 연다(iOS 일반 인앱 브라우저는 불가 → false). */
export function openInExternalBrowser(kind: InAppBrowser) {
  const url = window.location.href;
  if (kind === "kakaotalk") {
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
    return true;
  }
  if (kind === "android") {
    const scheme = window.location.protocol.replace(":", "");
    window.location.href = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=${scheme};package=com.android.chrome;end`;
    return true;
  }
  return false;
}
