import type { CurrentUser } from "@/lib/auth/types";
import { Avatar, ProviderBadge } from "./bits";
import { LogoutButton } from "./LogoutButton";

/** 내 청첩장 상단의 계정 정보(어떤 계정으로 로그인했는지 바로 알 수 있게) */
export function AccountCard({ user }: { user: CurrentUser }) {
  return (
    <section className="flex items-center gap-4 rounded-3xl border border-line bg-white p-4 sm:p-5">
      <Avatar user={user} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{user.name}</p>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted">
          <ProviderBadge provider={user.provider} />
          <span className="truncate">{user.email || "계정으로 로그인됨"}</span>
        </p>
      </div>
      <LogoutButton className="shrink-0 rounded-xl border border-line px-3.5 py-2 text-sm font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink disabled:opacity-50" />
    </section>
  );
}
