// 클라이언트에서 넘어온 청첩장 데이터를 신뢰하지 않고, 스키마에 맞게 다시 만든다.
// (타입이 다르거나 너무 긴 값, 허용되지 않은 URL 등은 버린다)
import { LIMITS } from "../config";
import { parseHM, parseYMD } from "./date";
import { blankData } from "./defaults";
import { FONTS, PALETTES, THEMES } from "./themes";
import type {
  AccountGroup,
  AccountItem,
  InvitationData,
  NoticeItem,
  Parent,
  Person,
  TransportItem,
  TransportType,
} from "./types";

type Rec = Record<string, unknown>;

const obj = (v: unknown): Rec =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : {};
const str = (v: unknown, max: number, fallback = "") =>
  typeof v === "string" ? v.slice(0, max) : fallback;
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const oneOf = <T extends string>(v: unknown, list: readonly T[], fallback: T): T =>
  list.includes(v as T) ? (v as T) : fallback;
const list = (v: unknown, max: number) => (Array.isArray(v) ? v.slice(0, max) : []);
const itemId = (v: unknown, i: number) => {
  const s = str(v, 40);
  return /^[\w-]+$/.test(s) ? s : `item-${i}`;
};

/** 같은 출처 경로(/api/files/…, /samples/…) 또는 https URL만 허용 */
export const safeUrl = (v: unknown) => {
  const s = str(v, 600).trim();
  return /^\/(?!\/)[\w\-./]*$/.test(s) || /^https:\/\/[^\s"'<>]+$/.test(s) ? s : "";
};

const THEME_IDS = THEMES.map((t) => t.id);
const PALETTE_IDS = PALETTES.map((p) => p.id);
const FONT_IDS = FONTS.map((f) => f.id);
const TRANSPORT_TYPES: TransportType[] = [
  "subway",
  "bus",
  "car",
  "parking",
  "train",
  "shuttle",
  "etc",
];

function parentOf(v: unknown, base: Parent): Parent {
  const o = obj(v);
  return {
    name: str(o.name, 20, base.name),
    deceased: bool(o.deceased, base.deceased),
    phone: str(o.phone, 20, base.phone),
  };
}

function personOf(v: unknown, base: Person): Person {
  const o = obj(v);
  return {
    lastName: str(o.lastName, 10, base.lastName),
    firstName: str(o.firstName, 20, base.firstName),
    relation: str(o.relation, 10, base.relation),
    phone: str(o.phone, 20, base.phone),
    father: parentOf(o.father, base.father),
    mother: parentOf(o.mother, base.mother),
  };
}

function accountGroupOf(v: unknown, base: AccountGroup): AccountGroup {
  const o = obj(v);
  return {
    enabled: bool(o.enabled, base.enabled),
    title: str(o.title, 30, base.title),
    items: list(o.items, 6).map((raw, i): AccountItem => {
      const a = obj(raw);
      return {
        id: itemId(a.id, i),
        role: str(a.role, 20),
        holder: str(a.holder, 20),
        bank: str(a.bank, 20),
        number: str(a.number, 40),
        kakaopay: safeUrl(a.kakaopay).startsWith("https://") ? safeUrl(a.kakaopay) : "",
      };
    }),
  };
}

export function normalizeData(input: unknown): InvitationData {
  const base = blankData();
  const o = obj(input);

  const design = obj(o.design);
  const wedding = obj(o.wedding);
  const venue = obj(o.venue);
  const main = obj(o.main);
  const greeting = obj(o.greeting);
  const calendar = obj(o.calendar);
  const gallery = obj(o.gallery);
  const location = obj(o.location);
  const notice = obj(o.notice);
  const account = obj(o.account);
  const guestbook = obj(o.guestbook);
  const rsvp = obj(o.rsvp);
  const bgm = obj(o.bgm);
  const ending = obj(o.ending);
  const share = obj(o.share);

  const date = str(wedding.date, 10);
  const time = str(wedding.time, 5);

  return {
    version: 1,
    design: {
      theme: oneOf(design.theme, THEME_IDS, base.design.theme),
      palette: oneOf(design.palette, PALETTE_IDS, base.design.palette),
      font: oneOf(design.font, FONT_IDS, base.design.font),
      fontScale: oneOf(design.fontScale, ["S", "M", "L"] as const, "M"),
    },
    groom: personOf(o.groom, base.groom),
    bride: personOf(o.bride, base.bride),
    wedding: {
      date: parseYMD(date) ? date : "",
      time: parseHM(time) ? time : base.wedding.time,
    },
    venue: {
      enabled: bool(venue.enabled, true),
      name: str(venue.name, 40),
      hall: str(venue.hall, 40),
      address: str(venue.address, 120),
      tel: str(venue.tel, 20),
    },
    main: { photo: safeUrl(main.photo), kicker: str(main.kicker, 40) },
    greeting: {
      enabled: bool(greeting.enabled, true),
      title: str(greeting.title, 40),
      content: str(greeting.content, 1000),
      showParents: bool(greeting.showParents, true),
      deceasedMark: oneOf(greeting.deceasedMark, ["hanja", "flower"] as const, "hanja"),
    },
    calendar: {
      enabled: bool(calendar.enabled, true),
      countdown: bool(calendar.countdown, true),
    },
    gallery: {
      enabled: bool(gallery.enabled, true),
      layout: oneOf(gallery.layout, ["slide", "grid"] as const, "slide"),
      images: list(gallery.images, LIMITS.galleryMax).map(safeUrl).filter(Boolean),
      preventZoom: bool(gallery.preventZoom, false),
    },
    location: {
      showNavButtons: bool(location.showNavButtons, true),
      transports: list(location.transports, 10).map((raw, i): TransportItem => {
        const t = obj(raw);
        return {
          id: itemId(t.id, i),
          type: oneOf(t.type, TRANSPORT_TYPES, "etc"),
          title: str(t.title, 20),
          content: str(t.content, 500),
        };
      }),
    },
    notice: {
      enabled: bool(notice.enabled, false),
      title: str(notice.title, 30, base.notice.title),
      items: list(notice.items, 6).map((raw, i): NoticeItem => {
        const n = obj(raw);
        return { id: itemId(n.id, i), title: str(n.title, 20), content: str(n.content, 600) };
      }),
    },
    account: {
      enabled: bool(account.enabled, true),
      title: str(account.title, 30, base.account.title),
      message: str(account.message, 300),
      groom: accountGroupOf(account.groom, base.account.groom),
      bride: accountGroupOf(account.bride, base.account.bride),
    },
    guestbook: { enabled: bool(guestbook.enabled, true) },
    rsvp: {
      enabled: bool(rsvp.enabled, true),
      message: str(rsvp.message, 300),
      askMeal: bool(rsvp.askMeal, true),
    },
    bgm: {
      enabled: bool(bgm.enabled, false),
      src: safeUrl(bgm.src),
      autoplay: bool(bgm.autoplay, true),
    },
    ending: {
      enabled: bool(ending.enabled, true),
      photo: safeUrl(ending.photo),
      message: str(ending.message, 300),
    },
    share: {
      title: str(share.title, 60),
      description: str(share.description, 120),
      image: safeUrl(share.image),
    },
  };
}

/** 저장 전에 꼭 필요한 값 확인. 비어 있으면 사용자에게 보여줄 메시지 목록을 돌려준다. */
export function validateData(data: InvitationData): string[] {
  const errors: string[] = [];
  if (!data.groom.lastName.trim() || !data.groom.firstName.trim())
    errors.push("신랑 성함을 입력해 주세요.");
  if (!data.bride.lastName.trim() || !data.bride.firstName.trim())
    errors.push("신부 성함을 입력해 주세요.");
  if (!parseYMD(data.wedding.date)) errors.push("예식 날짜를 선택해 주세요.");
  if (!parseHM(data.wedding.time)) errors.push("예식 시간을 선택해 주세요.");
  if (data.venue.enabled && !data.venue.name.trim())
    errors.push("예식장 이름을 입력해 주세요.");
  return errors;
}
