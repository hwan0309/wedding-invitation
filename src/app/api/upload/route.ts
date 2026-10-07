import { LIMITS } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth/session";
import { saveUpload, sniff } from "@/lib/server/uploads";

const error = (message: string, status: number) => Response.json({ error: message }, { status });

export async function POST(request: Request) {
  if (!(await getCurrentUser())) return error("로그인한 뒤에 업로드할 수 있어요.", 401);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return error("파일이 없어요.", 400);

  const kind = form?.get("kind") === "audio" ? "audio" : "image";
  const max = kind === "audio" ? LIMITS.audioMaxBytes : LIMITS.imageMaxBytes;
  if (file.size > max) return error("20MB 이하 파일만 올릴 수 있어요.", 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type || type.kind !== kind) {
    return error(
      kind === "audio" ? "MP3 또는 M4A 파일만 올릴 수 있어요." : "JPG, PNG, WebP 사진만 올릴 수 있어요.",
      415,
    );
  }

  return Response.json({ url: await saveUpload(bytes, type.ext) });
}
