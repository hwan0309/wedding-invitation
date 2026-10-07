import { readUpload } from "@/lib/server/uploads";

export async function GET(_request: Request, ctx: RouteContext<"/api/files/[name]">) {
  const { name } = await ctx.params;
  const file = await readUpload(name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.type,
      // 파일 이름이 매번 새로 만들어지므로 영구 캐시해도 안전하다.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
