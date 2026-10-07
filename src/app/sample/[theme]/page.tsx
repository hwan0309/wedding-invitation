import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { InvitationView } from "@/components/invitation/InvitationView";
import { createSampleData } from "@/lib/invitation/defaults";
import { THEMES, getTheme, isThemeId } from "@/lib/invitation/themes";

export function generateStaticParams() {
  return THEMES.map((t) => ({ theme: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/sample/[theme]">): Promise<Metadata> {
  const { theme } = await params;
  return { title: `${getTheme(theme).name} 테마 샘플` };
}

async function Sample({ params }: { params: PageProps<"/sample/[theme]">["params"] }) {
  const { theme } = await params;
  if (!isThemeId(theme)) notFound();

  return (
    <>
      <InvitationView data={createSampleData(theme)} mode="sample" />
      <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
        <div className="flex items-center overflow-hidden rounded-full bg-white/95 text-[14px] font-semibold shadow-xl shadow-black/15 ring-1 ring-black/5 backdrop-blur">
          <Link href={`/create?theme=${theme}`} className="px-5 py-3.5 text-brand hover:bg-brand-soft">
            이 디자인으로 만들기
          </Link>
          <span className="h-4 w-px bg-line" aria-hidden />
          <Link href="/samples" className="px-5 py-3.5 text-ink-soft hover:bg-paper">
            다른 샘플 보기
          </Link>
        </div>
      </div>
    </>
  );
}

export default function SamplePage({ params }: PageProps<"/sample/[theme]">) {
  return (
    <div className="invitation-page pb-24">
      <Suspense fallback={<div className="mx-auto min-h-svh max-w-[480px] bg-white" />}>
        <Sample params={params} />
      </Suspense>
    </div>
  );
}
