import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountCard } from "@/components/auth/AccountCard";
import { InvitationList, type InvitationSummary } from "@/components/my/InvitationList";
import { SiteHeader } from "@/components/site/SiteChrome";
import { getCurrentUser } from "@/lib/auth/session";
import { LIMITS } from "@/lib/config";
import { store } from "@/lib/db";

export const metadata: Metadata = { title: "내 청첩장", robots: { index: false } };

async function MyInvitations() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/my");

  const records = await store.listInvitations(user.id);
  const items: InvitationSummary[] = await Promise.all(
    records.map(async (r) => {
      const [rsvp, guestbook] = await Promise.all([store.listRsvp(r.id), store.listGuestbook(r.id)]);
      return {
        id: r.id,
        data: r.data,
        updatedAt: r.updatedAt,
        rsvpCount: rsvp.length,
        guestbookCount: guestbook.length,
      };
    }),
  );

  return (
    <>
      <AccountCard user={user} />
      <div className="mt-8">
        <InvitationList items={items} limit={LIMITS.invitationsPerOwner} />
      </div>
    </>
  );
}

export default function MyPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100svh-64px)] bg-paper">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-[28px] font-bold tracking-tight">내 청첩장</h1>
          <p className="mt-2 text-sm text-muted">
            계정에 저장돼 있어서 휴대폰·PC 어디서 로그인해도 이어서 수정할 수 있어요.
          </p>
          <div className="mt-8">
            <Suspense fallback={<p className="py-20 text-center text-sm text-muted">불러오는 중…</p>}>
              <MyInvitations />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
