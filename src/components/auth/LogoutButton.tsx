"use client";

import { useTransition } from "react";
import { signOut } from "@/app/auth-actions";

export function LogoutButton({ className, role }: { className?: string; role?: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      role={role}
      disabled={pending}
      onClick={() => startTransition(() => signOut())}
      className={className}
    >
      {pending ? "로그아웃 중…" : "로그아웃"}
    </button>
  );
}
