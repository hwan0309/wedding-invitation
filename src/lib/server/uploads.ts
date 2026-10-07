import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "../db/local";
import { shortId } from "./security";

// 프로토타입용 파일 저장소(.data/uploads). 배포 시 Supabase Storage 등으로 교체.
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const TYPES = {
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
} as const;
type Ext = keyof typeof TYPES;

const isImage = (ext: Ext) => TYPES[ext].startsWith("image/");

/** 확장자나 Content-Type 대신 파일 앞부분(매직 넘버)으로 실제 형식을 판별한다. */
export function sniff(bytes: Uint8Array): { ext: Ext; kind: "image" | "audio" } | null {
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.subarray(start, end));
  let ext: Ext | null = null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ext = "jpg";
  else if (ascii(0, 4) === "\x89PNG") ext = "png";
  else if (ascii(0, 4) === "GIF8") ext = "gif";
  else if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") ext = "webp";
  else if (ascii(0, 3) === "ID3" || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) ext = "mp3";
  else if (ascii(4, 8) === "ftyp") ext = "m4a";
  return ext ? { ext, kind: isImage(ext) ? "image" : "audio" } : null;
}

export async function saveUpload(bytes: Uint8Array, ext: Ext) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${shortId(16)}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, name), bytes);
  return `/api/files/${name}`;
}

export async function readUpload(name: string) {
  const match = /^[a-z0-9]{16}\.(jpg|png|gif|webp|mp3|m4a)$/.exec(name);
  if (!match) return null;
  try {
    const bytes = await readFile(path.join(UPLOAD_DIR, name));
    return { bytes, type: TYPES[match[1] as Ext] };
  } catch {
    return null;
  }
}
