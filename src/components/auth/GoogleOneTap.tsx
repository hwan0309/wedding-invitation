"use client";

import { useEffect, useEffectEvent } from "react";
import { loadScript } from "@/lib/script";

interface GoogleIdentity {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    nonce?: string;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: "signin" | "signup" | "use";
    itp_support?: boolean;
    use_fedcm_for_prompt?: boolean;
  }): void;
  prompt(): void;
  cancel(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

/**
 * 구글 원탭 로그인.
 * autoSelect가 켜져 있으면, 예전에 이 사이트에 구글로 로그인한 적 있는 사용자는 클릭 없이 바로 로그인된다.
 */
export function GoogleOneTap({
  clientId,
  next,
  remember,
  autoSelect,
  onError,
}: {
  clientId: string;
  next: string;
  remember: boolean;
  autoSelect: boolean;
  onError: (message: string) => void;
}) {
  // 원탭 결과는 나중에 도착하므로 그 시점의 '자동 로그인' 체크 상태를 쓴다.
  const handleCredential = useEffectEvent(async (credential: string) => {
    const res = await fetch("/api/auth/google/one-tap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential, next, remember }),
    });
    const body = (await res.json().catch(() => ({}))) as { next?: string; error?: string };
    if (res.ok) window.location.assign(body.next ?? next);
    else onError(body.error ?? "Google 로그인을 확인하지 못했어요.");
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/auth/google/one-tap", { cache: "no-store" });
      if (!res.ok || cancelled) return;
      const { nonce } = (await res.json()) as { nonce: string };
      await loadScript("https://accounts.google.com/gsi/client");
      const google = window.google;
      if (cancelled || !google) return;
      google.accounts.id.initialize({
        client_id: clientId,
        nonce,
        auto_select: autoSelect,
        cancel_on_tap_outside: false,
        context: "signin",
        itp_support: true,
        use_fedcm_for_prompt: true,
        callback: ({ credential }) => void handleCredential(credential),
      });
      google.accounts.id.prompt();
    })().catch(() => {
      // 원탭을 불러오지 못해도 아래 버튼으로 로그인할 수 있으므로 조용히 넘어간다.
    });
    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
  }, [clientId, autoSelect]);

  return null;
}
