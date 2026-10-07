import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { IconChevronLeft } from "@/components/icons";
import { Responses } from "@/components/my/Responses";
import { SiteHeader } from "@/components/site/SiteChrome";
import { store } from "@/lib/db";
import { fullName } from "@/lib/invitation/defaults";
import { getCurrentUser } from "@/lib/auth/session";
import { isInvitationId } from "@/lib/server/queries";

export const metadata: Metadata = { title: "응답 관리", robots: { index: false } };

async function ResponsesLoader({ params }: { params: PageProps<"/my/[id]">["params"] }) {
  const { id } = await params;
  const [user, record] = await Promise.all([getCurrentUser(), isInvitationId(id) ? store.getInvitation(id) : null]);
  if (!user) redirect(`/login?next=${encodeURIComponent(`/my/${id}`)}`);
  if (!record || record.ownerId !== user.id) notFound();

  const [rsvp, guestbook] = await Promise.all([store.listRsvp(id), store.listGuestbook(id)]);
  const title = `${fullName(record.data.groom)} ♥ ${fullName(record.data.bride)}`;

  return (
    <>
      <h1 className="text-[28px] font-bold tracking-tight">응답 관리</h1>
      <p className="mt-1 text-ink-soft">{title}</p>
      <div className="mt-8">
        <Responses
          invitationId={id}
          rsvp={rsvp.map((r) => ({
            id: r.id,
            side: r.side,
            attending: r.attending,
            name: r.name,
            companions: r.companions,
            meal: r.meal,
            phone: r.phone,
            message: r.message,
            createdAt: r.createdAt,
          }))}
          guestbook={guestbook.map(({ id, name, message, createdAt }) => ({ id, name, message, createdAt }))}
        />
      </div>
    </>
  );
}

export default function ResponsesPage({ params }: PageProps<"/my/[id]">) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100svh-64px)] bg-paper">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <Link href="/my" className="mb-6 inline-flex items-center gap-0.5 text-sm font-semibold text-ink-soft hover:text-ink">
            <IconChevronLeft size={16} /> 내 청첩장
          </Link>
          <Suspense fallback={<p className="py-20 text-center text-sm text-muted">불러오는 중…</p>}>
            <ResponsesLoader params={params} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
