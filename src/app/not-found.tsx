import Link from "next/link";
import { Logo } from "@/components/site/SiteChrome";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <Logo />
      <h1 className="mt-4 text-2xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="max-w-sm text-ink-soft">
        주소가 바뀌었거나 삭제된 청첩장일 수 있어요. 받은 링크를 다시 확인해 주세요.
      </p>
      <Link href="/" className="mt-4 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
        홈으로 가기
      </Link>
    </main>
  );
}
