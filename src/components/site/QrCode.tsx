"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Dialog } from "./Dialog";

/** 청첩장 링크 QR 코드(종이 청첩장 인쇄용 PNG 저장) */
export function QrDialog({
  open,
  url,
  filename,
  onClose,
}: {
  open: boolean;
  url: string;
  filename: string;
  onClose: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    QRCode.toDataURL(url, { width: 1024, margin: 2, color: { dark: "#211e1b", light: "#ffffff" } })
      .then((data) => !cancelled && setSrc(data))
      .catch(() => !cancelled && setSrc(null));
    return () => {
      cancelled = true;
    };
  }, [open, url]);

  return (
    <Dialog open={open} title="QR 코드" onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div className="grid h-56 w-56 place-items-center rounded-2xl border border-line bg-white p-3">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="청첩장 QR 코드" className="h-full w-full" />
          ) : (
            <span className="text-sm text-muted">만드는 중…</span>
          )}
        </div>
        <p className="mt-4 break-all font-mono text-xs text-muted">{url}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          청첩장을 수정해도 QR 코드는 바뀌지 않아요.
          <br />
          종이 청첩장에 먼저 인쇄해 두셔도 괜찮아요.
        </p>
        <a
          href={src ?? undefined}
          download={`${filename}.png`}
          aria-disabled={!src}
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-ink font-semibold text-white aria-disabled:opacity-40"
        >
          PNG로 저장하기
        </a>
      </div>
    </Dialog>
  );
}
