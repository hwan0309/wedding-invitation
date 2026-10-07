"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PROVIDER_LABEL, type CurrentUser } from "@/lib/auth/types";
import { Avatar } from "./bits";
import { LogoutButton } from "./LogoutButton";

const itemClass =
  "flex w-full items-center rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-ink-soft hover:bg-paper hover:text-ink";

export function UserMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user.name} 계정 메뉴`}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 transition hover:bg-paper sm:pr-3"
      >
        <Avatar user={user} size={30} />
        <span className="hidden max-w-[110px] truncate text-[14px] font-semibold text-ink sm:block">{user.name}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-40 mt-2 w-64 rounded-2xl border border-line bg-white p-2 shadow-xl shadow-black/10">
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar user={user} size={40} />
            <div className="min-w-0">
              <p className="truncate font-bold">{user.name}</p>
              <p className="truncate text-[12px] text-muted">
                {PROVIDER_LABEL[user.provider]} 계정{user.email ? ` · ${user.email}` : ""}
              </p>
            </div>
          </div>
          <div className="my-1 h-px bg-line" />
          <Link role="menuitem" href="/my" className={itemClass} onClick={() => setOpen(false)}>
            내 청첩장
          </Link>
          <Link role="menuitem" href="/create" className={itemClass} onClick={() => setOpen(false)}>
            새 청첩장 만들기
          </Link>
          <LogoutButton role="menuitem" className={`${itemClass} disabled:opacity-50`} />
        </div>
      )}
    </div>
  );
}
