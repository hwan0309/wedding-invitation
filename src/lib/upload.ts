// 브라우저에서 사진을 줄인 뒤 업로드한다.
// 원본(수 MB)을 그대로 저장하지 않으니 저장 비용과 하객 데이터 사용량이 크게 줄어든다.
import { LIMITS } from "./config";

type ImageFormat = "webp" | "jpeg";

async function compressImage(file: File, maxSide: number, format: ImageFormat): Promise<Blob> {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.86));
  let blob = format === "webp" ? await encode("image/webp") : null;
  // WebP 인코딩을 지원하지 않는 브라우저는 PNG를 돌려주므로 JPEG로 다시 만든다.
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg");
  return blob && blob.size < file.size ? blob : file;
}

async function upload(file: Blob, kind: "image" | "audio", name: string) {
  const form = new FormData();
  form.append("file", file, name);
  form.append("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !body.url) throw new Error(body.error ?? "업로드하지 못했어요. 다시 시도해 주세요.");
  return body.url;
}

/**
 * @param format 공유 썸네일처럼 메신저 호환성이 중요한 사진은 "jpeg"
 */
export async function uploadImage(file: File, { maxSide = 1920, format = "webp" as ImageFormat } = {}) {
  if (!file.type.startsWith("image/")) throw new Error("사진 파일만 올릴 수 있어요.");
  if (file.size > LIMITS.imageMaxBytes) throw new Error("사진은 한 장에 20MB 이하만 올릴 수 있어요.");
  return upload(await compressImage(file, maxSide, format), "image", file.name);
}

export async function uploadAudio(file: File) {
  if (file.size > LIMITS.audioMaxBytes) throw new Error("음원은 20MB 이하만 올릴 수 있어요.");
  return upload(file, "audio", file.name);
}
