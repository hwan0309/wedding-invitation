import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InvitationView } from "@/components/invitation/InvitationView";
import { shareMeta } from "@/lib/invitation/defaults";
import { getPublicInvitation } from "@/lib/server/queries";

export async function generateMetadata({ params }: PageProps<"/i/[id]">): Promise<Metadata> {
  const { id } = await params;
  const invitation = await getPublicInvitation(id);
  // 이름·연락처·계좌가 담긴 페이지라 검색 엔진에는 노출하지 않는다.
  const robots = { index: false, follow: false };
  if (!invitation) return { title: "청첩장을 찾을 수 없어요", robots };

  const meta = shareMeta(invitation.data);
  return {
    title: { absolute: meta.title },
    description: meta.description,
    robots,
    openGraph: {
      type: "website",
      title: meta.title,
      description: meta.description,
      images: meta.image ? [{ url: meta.image }] : undefined,
    },
    twitter: { card: "summary_large_image" },
  };
}

function InvitationSkeleton() {
  return (
    <div className="mx-auto flex min-h-svh max-w-[480px] flex-col items-center justify-center gap-3 bg-white">
      <span className="h-2 w-2 animate-ping rounded-full bg-brand" />
      <p className="text-sm text-muted">청첩장을 펼치는 중…</p>
    </div>
  );
}

async function InvitationLoader({ params }: { params: PageProps<"/i/[id]">["params"] }) {
  const { id } = await params;
  const invitation = await getPublicInvitation(id);
  if (!invitation) notFound();
  return <InvitationView data={invitation.data} mode="live" invitationId={invitation.id} />;
}

export default function InvitationPage({ params }: PageProps<"/i/[id]">) {
  return (
    <div className="invitation-page">
      <Suspense fallback={<InvitationSkeleton />}>
        <InvitationLoader params={params} />
      </Suspense>
    </div>
  );
}
