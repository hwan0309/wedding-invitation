import { formatDateKo, formatTimeKo } from "./date";
import { COVER_PHOTO, ENDING_PHOTO, GALLERY_PHOTOS, photo } from "./photos";
import { getTheme } from "./themes";
import type { InvitationData, Parent, Person, ThemeId } from "./types";

export const KICKER_BY_THEME: Record<ThemeId, string> = {
  basic: "SAVE THE DATE",
  arch: "We're getting married",
  poster: "THE WEDDING OF",
  classic: "The Wedding of",
  lettering: "Our Wedding Day",
  minimal: "SAVE THE DATE",
  polaroid: "Our little wedding",
  magazine: "Love Story",
  circle: "THE WEDDING OF",
  sealing: "You're invited",
  film: "Save our date",
  collage: "We're getting married",
};

const parent = (name = "", phone = ""): Parent => ({ name, deceased: false, phone });

const person = (p: Partial<Person> = {}): Person => ({
  lastName: "",
  firstName: "",
  relation: "",
  phone: "",
  father: parent(),
  mother: parent(),
  ...p,
});

/** 모든 필드가 비어 있는 기본 구조. 저장 데이터 정규화의 기준이 된다. */
export function blankData(): InvitationData {
  return {
    version: 1,
    design: { theme: "basic", palette: "ivory", font: "pretendard", fontScale: "M" },
    groom: person({ relation: "아들" }),
    bride: person({ relation: "딸" }),
    wedding: { date: "", time: "12:00" },
    venue: { enabled: true, name: "", hall: "", address: "", tel: "" },
    main: { photo: "", kicker: "" },
    greeting: {
      enabled: true,
      title: "",
      content: "",
      showParents: true,
      deceasedMark: "hanja",
    },
    calendar: { enabled: true, countdown: true },
    gallery: { enabled: true, layout: "slide", images: [], preventZoom: false },
    location: { transports: [], showNavButtons: true },
    notice: { enabled: false, title: "안내사항", items: [] },
    account: {
      enabled: true,
      title: "마음 전하실 곳",
      message: "",
      groom: { enabled: true, title: "신랑측 계좌번호", items: [] },
      bride: { enabled: true, title: "신부측 계좌번호", items: [] },
    },
    guestbook: { enabled: true },
    rsvp: { enabled: true, message: "", askMeal: true },
    bgm: { enabled: false, src: "", autoplay: true },
    ending: { enabled: true, photo: "", message: "" },
    share: { title: "", description: "", image: "" },
  };
}

/** 새 청첩장을 만들 때 채워 넣는 예시 내용. 사용자는 고치기만 하면 된다. */
export function createSampleData(themeId: ThemeId = "basic"): InvitationData {
  const theme = getTheme(themeId);
  const data = blankData();
  return {
    ...data,
    design: { theme: theme.id, palette: theme.palette, font: theme.font, fontScale: "M" },
    groom: person({
      lastName: "이",
      firstName: "준호",
      relation: "장남",
      phone: "010-0000-0000",
      father: parent("이성민", "010-0000-0000"),
      mother: parent("김미경", "010-0000-0000"),
    }),
    bride: person({
      lastName: "김",
      firstName: "서연",
      relation: "장녀",
      phone: "010-0000-0000",
      father: parent("김정훈", "010-0000-0000"),
      mother: parent("박은정", "010-0000-0000"),
    }),
    wedding: { date: "2027-05-15", time: "12:30" },
    venue: {
      enabled: true,
      name: "다솜 웨딩홀",
      hall: "5층 그랜드볼룸",
      address: "서울특별시 중구 세종대로 110",
      tel: "02-000-0000",
    },
    main: { photo: photo(COVER_PHOTO[theme.id]), kicker: KICKER_BY_THEME[theme.id] },
    greeting: {
      ...data.greeting,
      title: "소중한 분들을 초대합니다",
      content:
        "서로 다른 길을 걸어온 두 사람이\n이제 같은 길을 함께 걸어가려 합니다.\n\n늘 곁에서 아껴주신 고마운 분들을 모시고\n사랑의 약속을 하려 하오니\n귀한 걸음으로 축복해 주시면\n더없는 기쁨으로 간직하겠습니다.",
    },
    gallery: { ...data.gallery, images: GALLERY_PHOTOS.map((key) => photo(key)) },
    location: {
      showNavButtons: true,
      transports: [
        { id: "t1", type: "subway", title: "지하철", content: "1·2호선 시청역 5번 출구에서 도보 3분" },
        {
          id: "t2",
          type: "bus",
          title: "버스",
          content: "시청 정류장 하차\n간선 100, 150, 402 · 지선 7016",
        },
        {
          id: "t3",
          type: "car",
          title: "자가용",
          content: "내비게이션에 '다솜 웨딩홀' 검색\n건물 지하 주차장 2시간 무료",
        },
      ],
    },
    notice: {
      enabled: true,
      title: "안내사항",
      items: [
        {
          id: "n1",
          title: "식사 안내",
          content:
            "예식 후 2층 연회장에서 뷔페 식사가 준비되어 있습니다.\n편하게 오셔서 함께 식사하며 축하해 주세요.",
        },
        {
          id: "n2",
          title: "포토부스",
          content:
            "로비에 포토부스가 마련되어 있습니다.\n즐거운 추억을 사진으로 남겨 주세요.",
        },
      ],
    },
    account: {
      ...data.account,
      message:
        "참석이 어려우신 분들을 위해 계좌번호를 기재하였습니다.\n너그러운 마음으로 양해 부탁드립니다.",
      groom: {
        enabled: true,
        title: "신랑측 계좌번호",
        items: [
          { id: "ga1", role: "신랑", holder: "이준호", bank: "국민은행", number: "000000-00-000000", kakaopay: "" },
          { id: "ga2", role: "아버지", holder: "이성민", bank: "신한은행", number: "000-000-000000", kakaopay: "" },
        ],
      },
      bride: {
        enabled: true,
        title: "신부측 계좌번호",
        items: [
          { id: "ba1", role: "신부", holder: "김서연", bank: "우리은행", number: "0000-000-000000", kakaopay: "" },
          { id: "ba2", role: "어머니", holder: "박은정", bank: "하나은행", number: "000-000000-00000", kakaopay: "" },
        ],
      },
    },
    rsvp: {
      ...data.rsvp,
      message:
        "축하의 마음으로 참석해 주시는 모든 분들을\n정성껏 모실 수 있도록\n참석 여부를 미리 알려주시면 감사하겠습니다.",
    },
    ending: {
      enabled: true,
      photo: photo(ENDING_PHOTO, 1200, 900),
      message: "저희의 새로운 시작을 함께해 주셔서\n진심으로 감사드립니다.",
    },
  };
}

export const fullName = (p: Person) => `${p.lastName}${p.firstName}`.trim();

/** 공유 미리보기 제목/설명/이미지(입력하지 않으면 기본 문구로 채운다) */
export function shareMeta(data: InvitationData) {
  const groom = fullName(data.groom) || "신랑";
  const bride = fullName(data.bride) || "신부";
  const when = `${formatDateKo(data.wedding.date)} ${formatTimeKo(data.wedding.time)}`.trim();
  const where = data.venue.enabled ? `${data.venue.name} ${data.venue.hall}`.trim() : "";
  return {
    title: data.share.title.trim() || `${groom} ♥ ${bride} 결혼합니다`,
    description:
      data.share.description.trim() || [when, where].filter(Boolean).join("\n"),
    image: data.share.image || data.main.photo,
  };
}
