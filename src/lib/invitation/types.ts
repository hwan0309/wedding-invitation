export type ThemeId =
  | "basic"
  | "arch"
  | "poster"
  | "classic"
  | "lettering"
  | "minimal"
  | "polaroid"
  | "magazine"
  | "circle"
  | "sealing"
  | "film"
  | "collage";
export type PaletteId =
  | "ivory"
  | "cream"
  | "blush"
  | "sage"
  | "lavender"
  | "wine"
  | "mono"
  | "midnight";
export type FontId =
  | "pretendard"
  | "gowun-dodum"
  | "gowun-batang"
  | "noto-serif"
  | "nanum-myeongjo"
  | "hahmlet"
  | "song-myung"
  | "nanum-pen"
  | "gaegu"
  | "ibm-plex";
export type FontScale = "S" | "M" | "L";

export interface Parent {
  name: string;
  deceased: boolean;
  phone: string;
}

export interface Person {
  lastName: string;
  firstName: string;
  /** 아들, 장남, 딸, 장녀 … */
  relation: string;
  phone: string;
  father: Parent;
  mother: Parent;
}

export type TransportType =
  | "subway"
  | "bus"
  | "car"
  | "parking"
  | "train"
  | "shuttle"
  | "etc";

export interface TransportItem {
  id: string;
  type: TransportType;
  title: string;
  content: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
}

export interface AccountItem {
  id: string;
  /** 신랑, 신랑 아버지 … */
  role: string;
  holder: string;
  bank: string;
  number: string;
  kakaopay: string;
}

export interface AccountGroup {
  enabled: boolean;
  title: string;
  items: AccountItem[];
}

export interface InvitationData {
  version: 1;
  design: {
    theme: ThemeId;
    palette: PaletteId;
    font: FontId;
    fontScale: FontScale;
  };
  groom: Person;
  bride: Person;
  /** 예식 날짜/시간은 한국 시간 기준 문자열로만 저장한다(시간대 변환으로 날짜가 바뀌는 문제 방지). */
  wedding: { date: string; time: string };
  venue: {
    enabled: boolean;
    name: string;
    hall: string;
    address: string;
    tel: string;
  };
  main: { photo: string; kicker: string };
  greeting: {
    enabled: boolean;
    title: string;
    content: string;
    showParents: boolean;
    deceasedMark: "hanja" | "flower";
  };
  calendar: { enabled: boolean; countdown: boolean };
  gallery: {
    enabled: boolean;
    layout: "slide" | "grid";
    images: string[];
    preventZoom: boolean;
  };
  location: { transports: TransportItem[]; showNavButtons: boolean };
  notice: { enabled: boolean; title: string; items: NoticeItem[] };
  account: {
    enabled: boolean;
    title: string;
    message: string;
    groom: AccountGroup;
    bride: AccountGroup;
  };
  guestbook: { enabled: boolean };
  rsvp: { enabled: boolean; message: string; askMeal: boolean };
  bgm: { enabled: boolean; src: string; autoplay: boolean };
  ending: { enabled: boolean; photo: string; message: string };
  share: { title: string; description: string; image: string };
}

/** 하객에게 공개되는 형태(소유자 정보 제외). */
export interface PublicInvitation {
  id: string;
  data: InvitationData;
  updatedAt: string;
}

export type ViewMode = "live" | "preview" | "sample";
