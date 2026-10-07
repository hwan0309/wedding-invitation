import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Editor } from "@/components/editor/Editor";
import { Logo } from "@/components/site/SiteChrome";
import { store } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { isInvitationId } from "@/lib/server/queries";

export const metadata: Metadata = {
  title: "청첩장 편집",
  robots: { index: false, follow: false },
};

function EditorSkeleton() {
  return (
    <div className="flex h-dvh flex-col bg-paper">
      <div className="h-14 border-b border-line bg-white" />
      <div className="flex flex-1 items-center justify-center text-sm text-muted">편집기를 여는 중…</div>
    </div>
  );
}

function NoAccess() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <Logo />
      <h1 className="mt-4 text-2xl font-bold">이 청첩장을 수정할 수 없어요</h1>
      <p className="max-w-sm text-ink-soft">
        다른 계정으로 만든 청첩장이에요. 청첩장을 만들 때 사용한 카카오·구글 계정으로 로그인해 주세요.
      </p>
      <Link href="/my" className="mt-4 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
        내 청첩장으로
      </Link>
    </main>
  );
}

async function EditorLoader({ params }: { params: PageProps<"/edit/[id]">["params"] }) {
  const { id } = await params;
  const [user, record] = await Promise.all([
    getCurrentUser(),
    isInvitationId(id) ? store.getInvitation(id) : null,
  ]);
  if (!user) redirect(`/login?next=${encodeURIComponent(`/edit/${id}`)}`);
  if (!record) notFound();
  if (record.ownerId !== user.id) return <NoAccess />;
  return <Editor id={record.id} initialData={record.data} initialUpdatedAt={record.updatedAt} />;
}

export default function EditPage({ params }: PageProps<"/edit/[id]">) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditorLoader params={params} />
    </Suspense>
  );
}
