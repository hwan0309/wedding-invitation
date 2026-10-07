"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { IconArrowDown, IconArrowUp, IconChevronDown, IconPlus, IconTrash } from "@/components/icons";

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-ink/40 focus:ring-4 focus:ring-ink/5 disabled:bg-paper disabled:text-muted";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, "h-11", className)} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(inputClass, "h-11 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9", className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238f877e' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}
    >
      {children}
    </select>
  );
}

export function Textarea({
  className,
  value,
  maxLength,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string }) {
  return (
    <div className="relative">
      <textarea
        {...props}
        value={value}
        maxLength={maxLength}
        className={cn(inputClass, "block resize-y py-3 leading-relaxed", maxLength !== undefined && "pb-7", className)}
      />
      {maxLength && (
        <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-muted">
          {value.length} / {maxLength}
        </span>
      )}
    </div>
  );
}

/**
 * 입력 하나에는 label, 버튼이 여러 개 들어가는 묶음(사진 업로드 등)에는 group 으로 쓴다
 * (label 안에 버튼을 넣으면 클릭 동작이 꼬이고 HTML 규칙에도 어긋난다).
 */
export function Field({
  label,
  hint,
  children,
  className,
  group,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  group?: boolean;
}) {
  const Tag = group ? "div" : "label";
  return (
    <Tag className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-[13px] font-semibold text-ink-soft">{label}</span>
      {children}
      {hint && <span className="text-[12px] leading-snug text-muted">{hint}</span>}
    </Tag>
  );
}

export function Row({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={cn("grid gap-3", cols === 3 ? "grid-cols-3" : "grid-cols-2")}>{children}</div>;
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition",
        checked ? "bg-brand" : "bg-line",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-xl bg-paper p-1" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 flex-1 rounded-lg text-sm font-medium transition",
            o.value === value ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-brand"
      />
      {children}
    </label>
  );
}

/** 편집 화면의 카드. toggle이 있으면 섹션 켜기/끄기 스위치를, collapsible이면 접기 기능을 보여준다. */
export function Card({
  title,
  description,
  enabled,
  onToggle,
  collapsible,
  defaultOpen = true,
  children,
}: {
  title: string;
  description?: string;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const showBody = (!collapsible || open) && enabled !== false && children;

  return (
    <section className="rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          type="button"
          className={cn("min-w-0 flex-1 text-left", !collapsible && "cursor-default")}
          onClick={() => collapsible && setOpen((v) => !v)}
          aria-expanded={collapsible ? open : undefined}
          aria-controls={collapsible ? bodyId : undefined}
          tabIndex={collapsible ? 0 : -1}
        >
          <span className="flex items-center gap-1.5 font-bold">
            {title}
            {collapsible && (
              <IconChevronDown size={16} className={cn("text-muted transition", open && "rotate-180")} />
            )}
          </span>
          {description && <span className="mt-0.5 block text-[13px] text-muted">{description}</span>}
        </button>
        {onToggle && <Switch checked={enabled ?? false} onChange={onToggle} label={`${title} 사용`} />}
      </div>
      {showBody && (
        <div id={bodyId} className="flex flex-col gap-4 border-t border-line px-5 py-5">
          {children}
        </div>
      )}
    </section>
  );
}

/** 교통편·안내사항·계좌처럼 항목을 추가/삭제/정렬하는 목록 */
export function ListEditor<T extends { id: string }>({
  items,
  onChange,
  max,
  addLabel,
  create,
  itemTitle,
  renderItem,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  max: number;
  addLabel: string;
  create: () => T;
  itemTitle: (item: T, index: number) => string;
  renderItem: (item: T, patch: (p: Partial<T>) => void) => ReactNode;
}) {
  const move = (i: number, delta: number) => {
    const next = [...items];
    [next[i], next[i + delta]] = [next[i + delta], next[i]];
    onChange(next);
  };
  const iconButton = "grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white hover:text-ink disabled:opacity-30";

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={item.id} className="rounded-2xl bg-paper p-4">
          <div className="mb-3 flex items-center gap-1">
            <span className="flex-1 text-sm font-semibold">{itemTitle(item, i)}</span>
            <button type="button" className={iconButton} disabled={i === 0} onClick={() => move(i, -1)} aria-label="위로">
              <IconArrowUp size={16} />
            </button>
            <button type="button" className={iconButton} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="아래로">
              <IconArrowDown size={16} />
            </button>
            <button type="button" className={iconButton} onClick={() => onChange(items.filter((x) => x.id !== item.id))} aria-label="삭제">
              <IconTrash size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {renderItem(item, (p) => onChange(items.map((x) => (x.id === item.id ? { ...x, ...p } : x))))}
          </div>
        </div>
      ))}
      {items.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...items, create()])}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink/20 text-sm font-semibold text-ink-soft hover:border-ink/40 hover:text-ink"
        >
          <IconPlus size={16} /> {addLabel}
        </button>
      ) : (
        <p className="text-center text-[12px] text-muted">최대 {max}개까지 넣을 수 있어요.</p>
      )}
    </div>
  );
}

// crypto.randomUUID는 https/localhost에서만 동작해서(휴대폰으로 내부 IP 접속 시 오류) 간단한 난수를 쓴다.
export const newId = () => Math.random().toString(36).slice(2, 10);
