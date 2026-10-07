// 하객이 남기는 데이터(방명록·참석 의사)의 공개 형태와 입력 검증. 서버/클라이언트 공용.
import { LIMITS } from "../config";

export interface GuestbookItem {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export interface RsvpInput {
  side: "groom" | "bride";
  attending: boolean;
  name: string;
  companions: number;
  meal: "yes" | "no" | "undecided";
  phone: string;
  message: string;
}

type Rec = Record<string, unknown>;
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function parseGuestbookInput(body: unknown) {
  const o = (body ?? {}) as Rec;
  const name = text(o.name);
  const message = text(o.message);
  const password = typeof o.password === "string" ? o.password : "";
  if (!name || name.length > LIMITS.guestbookNameMax)
    return { error: `이름은 1~${LIMITS.guestbookNameMax}자로 입력해 주세요.` } as const;
  if (password.length < 4 || password.length > 20)
    return { error: "비밀번호는 4~20자로 입력해 주세요." } as const;
  if (!message || message.length > LIMITS.guestbookMessageMax)
    return { error: `메시지는 1~${LIMITS.guestbookMessageMax}자로 입력해 주세요.` } as const;
  return { value: { name, message, password } } as const;
}

export function parseRsvpInput(body: unknown) {
  const o = (body ?? {}) as Rec;
  const name = text(o.name);
  if (!name || name.length > 20) return { error: "성함을 입력해 주세요." } as const;
  if (o.side !== "groom" && o.side !== "bride")
    return { error: "신랑측/신부측을 선택해 주세요." } as const;
  if (typeof o.attending !== "boolean") return { error: "참석 여부를 선택해 주세요." } as const;
  const companions = Number(o.companions ?? 0);
  if (!Number.isInteger(companions) || companions < 0 || companions > 10)
    return { error: "동행 인원은 0~10명으로 입력해 주세요." } as const;
  const meal = o.meal === "yes" || o.meal === "no" ? o.meal : "undecided";
  const value: RsvpInput = {
    side: o.side,
    attending: o.attending,
    name,
    companions: o.attending ? companions : 0,
    meal: o.attending ? meal : "no",
    phone: text(o.phone).slice(0, 20),
    message: text(o.message).slice(0, 200),
  };
  return { value } as const;
}
