"use client";

import { useRef, useState } from "react";
import { IconArrowDown, IconArrowUp, IconClose, IconImage, IconMusic, IconPlus } from "@/components/icons";
import { LIMITS } from "@/lib/config";
import { uploadAudio, uploadImage } from "@/lib/upload";

const buttonClass =
  "inline-flex h-9 items-center justify-center rounded-lg border border-line bg-white px-3 text-[13px] font-semibold text-ink-soft transition hover:border-ink/30 hover:text-ink disabled:opacity-50";

function Spinner() {
  return (
    <span className="absolute inset-0 grid place-items-center bg-white/70">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </span>
  );
}

function FilePicker({
  accept,
  multiple,
  onFiles,
  children,
  className,
  disabled,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  children: React.ReactNode;
  className: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className={className} onClick={() => ref.current?.click()} disabled={disabled}>
        {children}
      </button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </>
  );
}

export function ImageField({
  value,
  onChange,
  hint,
  aspect = "4 / 5",
  format = "webp",
  maxSide = 1920,
}: {
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  aspect?: string;
  format?: "webp" | "jpeg";
  maxSide?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async ([file]: File[]) => {
    setBusy(true);
    setError("");
    try {
      onChange(await uploadImage(file, { format, maxSide }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 shrink-0 overflow-hidden rounded-xl bg-cream" style={{ aspectRatio: aspect }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-muted">
            <IconImage size={22} />
          </span>
        )}
        {busy && <Spinner />}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex gap-2">
          <FilePicker accept="image/*" onFiles={pick} className={buttonClass} disabled={busy}>
            {value ? "사진 바꾸기" : "사진 올리기"}
          </FilePicker>
          {value && (
            <button type="button" className={buttonClass} onClick={() => onChange("")} disabled={busy}>
              빼기
            </button>
          )}
        </div>
        {hint && <p className="text-[12px] leading-snug text-muted">{hint}</p>}
        {error && <p className="text-[12px] text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export function GalleryField({
  images,
  onAppend,
  onChange,
}: {
  images: string[];
  /** 업로드가 끝날 때마다 하나씩 추가(최신 상태 기준으로 붙이기 위해 분리) */
  onAppend: (url: string) => void;
  onChange: (images: string[]) => void;
}) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const remaining = LIMITS.galleryMax - images.length;

  const add = async (files: File[]) => {
    const queue = files.slice(0, remaining);
    setError(files.length > remaining ? `최대 ${LIMITS.galleryMax}장까지 넣을 수 있어 ${remaining}장만 올려요.` : "");
    setProgress({ done: 0, total: queue.length });
    for (const [i, file] of queue.entries()) {
      try {
        onAppend(await uploadImage(file));
      } catch (err) {
        setError((err as Error).message);
      }
      setProgress({ done: i + 1, total: queue.length });
    }
    setProgress(null);
  };

  const move = (i: number, delta: number) => {
    const next = [...images];
    [next[i], next[i + delta]] = [next[i + delta], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`갤러리 ${i + 1}`} className="h-full w-full object-cover" />
            <span className="absolute left-1 top-1 rounded bg-black/50 px-1.5 text-[11px] font-semibold text-white">
              {i + 1}
            </span>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 to-transparent p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <span className="flex">
                <button type="button" className="p-1 text-white disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label="앞으로">
                  <IconArrowUp size={14} className="-rotate-90" />
                </button>
                <button type="button" className="p-1 text-white disabled:opacity-30" disabled={i === images.length - 1} onClick={() => move(i, 1)} aria-label="뒤로">
                  <IconArrowDown size={14} className="-rotate-90" />
                </button>
              </span>
              <button type="button" className="p-1 text-white" onClick={() => onChange(images.filter((_, j) => j !== i))} aria-label="삭제">
                <IconClose size={14} />
              </button>
            </div>
          </div>
        ))}
        {remaining > 0 && (
          <FilePicker
            accept="image/*"
            multiple
            onFiles={add}
            disabled={progress !== null}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink/20 text-[12px] font-semibold text-muted hover:border-ink/40 hover:text-ink disabled:opacity-60"
          >
            <IconPlus size={18} />
            {progress ? `${progress.done}/${progress.total}` : "추가"}
          </FilePicker>
        )}
      </div>
      <p className="text-[12px] text-muted">
        {images.length} / {LIMITS.galleryMax}장 · 여러 장을 한 번에 고를 수 있어요. 올릴 때 용량을 자동으로 줄여요.
      </p>
      {error && <p className="text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

export function AudioField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async ([file]: File[]) => {
    setBusy(true);
    setError("");
    try {
      onChange(await uploadAudio(file));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <audio src={value} controls className="w-full" />
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-paper px-4 py-3 text-sm text-muted">
          <IconMusic size={18} /> 아직 음원이 없어요
        </div>
      )}
      <div className="flex gap-2">
        <FilePicker accept="audio/mpeg,audio/mp4,.mp3,.m4a" onFiles={pick} className={buttonClass} disabled={busy}>
          {busy ? "올리는 중…" : value ? "음원 바꾸기" : "음원 올리기 (MP3)"}
        </FilePicker>
        {value && (
          <button type="button" className={buttonClass} onClick={() => onChange("")}>
            빼기
          </button>
        )}
      </div>
      {error && <p className="text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
