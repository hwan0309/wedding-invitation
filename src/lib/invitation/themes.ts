import type { FontId, FontScale, PaletteId, ThemeId } from "./types";

export interface ThemeDef {
  id: ThemeId;
  name: string;
  description: string;
  palette: PaletteId;
  font: FontId;
}

export const THEMES: ThemeDef[] = [
  {
    id: "basic",
    name: "베이직",
    description: "사진을 크게, 정보는 담백하게",
    palette: "ivory",
    font: "pretendard",
  },
  {
    id: "arch",
    name: "아치",
    description: "아치형 창 너머의 부드러운 분위기",
    palette: "cream",
    font: "gowun-batang",
  },
  {
    id: "poster",
    name: "포스터",
    description: "화면을 가득 채운 사진과 타이포",
    palette: "midnight",
    font: "noto-serif",
  },
  {
    id: "classic",
    name: "클래식",
    description: "이중 테두리와 세리프의 격식",
    palette: "cream",
    font: "nanum-myeongjo",
  },
  {
    id: "lettering",
    name: "레터링",
    description: "사진 위에 손글씨 레터링",
    palette: "blush",
    font: "gowun-dodum",
  },
  {
    id: "minimal",
    name: "미니멀",
    description: "사진 없이 날짜만, 단정하게",
    palette: "wine",
    font: "song-myung",
  },
  {
    id: "polaroid",
    name: "폴라로이드",
    description: "테이프로 붙인 폴라로이드 한 장",
    palette: "sage",
    font: "gaegu",
  },
  {
    id: "magazine",
    name: "매거진",
    description: "잡지 표지처럼 과감한 타이틀",
    palette: "mono",
    font: "ibm-plex",
  },
  {
    id: "circle",
    name: "서클",
    description: "둥근 사진을 감싸는 한 문장",
    palette: "lavender",
    font: "hahmlet",
  },
  {
    id: "sealing",
    name: "실링왁스",
    description: "봉투를 여는 듯한 실링 장식",
    palette: "wine",
    font: "gowun-batang",
  },
  {
    id: "film",
    name: "필름",
    description: "필름 카메라 감성의 캐주얼",
    palette: "mono",
    font: "nanum-pen",
  },
  {
    id: "collage",
    name: "콜라주",
    description: "세 장의 사진으로 담은 이야기",
    palette: "ivory",
    font: "pretendard",
  },
];

export interface PaletteDef {
  id: PaletteId;
  name: string;
  bg: string;
  surface: string;
  text: string;
  sub: string;
  accent: string;
  line: string;
  onAccent: string;
}

export const PALETTES: PaletteDef[] = [
  {
    id: "ivory",
    name: "화이트",
    bg: "#ffffff",
    surface: "#f8f6f2",
    text: "#3b3835",
    sub: "#8b847b",
    accent: "#b8926a",
    line: "#e9e4dc",
    onAccent: "#ffffff",
  },
  {
    id: "cream",
    name: "크림",
    bg: "#fbf7f1",
    surface: "#f3ecdf",
    text: "#4a4137",
    sub: "#94887a",
    accent: "#a8825c",
    line: "#e6dccb",
    onAccent: "#ffffff",
  },
  {
    id: "blush",
    name: "로즈",
    bg: "#fffaf9",
    surface: "#fbefed",
    text: "#4b3a3a",
    sub: "#9c8584",
    accent: "#c98380",
    line: "#f0dedb",
    onAccent: "#ffffff",
  },
  {
    id: "sage",
    name: "세이지",
    bg: "#f8f9f5",
    surface: "#eef1e8",
    text: "#3a4034",
    sub: "#7f8775",
    accent: "#788c66",
    line: "#dfe4d6",
    onAccent: "#ffffff",
  },
  {
    id: "lavender",
    name: "라벤더",
    bg: "#fbf9fe",
    surface: "#f1edf8",
    text: "#3e394b",
    sub: "#8a83a1",
    accent: "#8d7cc0",
    line: "#e5dff1",
    onAccent: "#ffffff",
  },
  {
    id: "wine",
    name: "와인",
    bg: "#fdf9f7",
    surface: "#f5ebe7",
    text: "#3c2a2b",
    sub: "#927f7b",
    accent: "#8c2f3c",
    line: "#ebdad5",
    onAccent: "#ffffff",
  },
  {
    id: "mono",
    name: "모노",
    bg: "#ffffff",
    surface: "#f3f3f2",
    text: "#1d1d1c",
    sub: "#7b7b78",
    accent: "#1d1d1c",
    line: "#e4e4e2",
    onAccent: "#ffffff",
  },
  {
    id: "midnight",
    name: "미드나잇",
    bg: "#1e222b",
    surface: "#262b36",
    text: "#ebe6dd",
    sub: "#a39d93",
    accent: "#cdb48c",
    line: "#3a404d",
    onAccent: "#1e222b",
  },
];

export interface FontDef {
  id: FontId;
  name: string;
  family: string;
  href: string;
  /** 손글씨처럼 작아 보이는 폰트 보정 */
  sizeAdjust: number;
}

const GF = "https://fonts.googleapis.com/css2?display=swap&family=";

export const FONTS: FontDef[] = [
  {
    id: "pretendard",
    name: "프리텐다드",
    family: '"Pretendard Variable", Pretendard, sans-serif',
    href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css",
    sizeAdjust: 1,
  },
  {
    id: "gowun-dodum",
    name: "고운돋움",
    family: '"Gowun Dodum", sans-serif',
    href: `${GF}Gowun+Dodum`,
    sizeAdjust: 1,
  },
  {
    id: "gowun-batang",
    name: "고운바탕",
    family: '"Gowun Batang", serif',
    href: `${GF}Gowun+Batang:wght@400;700`,
    sizeAdjust: 1,
  },
  {
    id: "noto-serif",
    name: "본명조",
    family: '"Noto Serif KR", serif',
    href: `${GF}Noto+Serif+KR:wght@400;600`,
    sizeAdjust: 0.98,
  },
  {
    id: "nanum-myeongjo",
    name: "나눔명조",
    family: '"Nanum Myeongjo", serif',
    href: `${GF}Nanum+Myeongjo:wght@400;700`,
    sizeAdjust: 1,
  },
  {
    id: "hahmlet",
    name: "함렛",
    family: '"Hahmlet", serif',
    href: `${GF}Hahmlet:wght@300;500`,
    sizeAdjust: 0.97,
  },
  {
    id: "song-myung",
    name: "송명",
    family: '"Song Myung", serif',
    href: `${GF}Song+Myung`,
    sizeAdjust: 1.02,
  },
  {
    id: "nanum-pen",
    name: "나눔손글씨 펜",
    family: '"Nanum Pen Script", cursive',
    href: `${GF}Nanum+Pen+Script`,
    sizeAdjust: 1.3,
  },
  {
    id: "gaegu",
    name: "개구",
    family: '"Gaegu", cursive',
    href: `${GF}Gaegu:wght@400;700`,
    sizeAdjust: 1.16,
  },
  {
    id: "ibm-plex",
    name: "IBM Plex",
    family: '"IBM Plex Sans KR", sans-serif',
    href: `${GF}IBM+Plex+Sans+KR:wght@400;500;600`,
    sizeAdjust: 0.98,
  },
];

/** 영문 장식 서체(섹션 라벨·날짜 숫자). 청첩장 페이지에서 항상 함께 로드한다. */
export const DISPLAY_FONT_HREF = `${GF}Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Pinyon+Script`;

export const FONT_SCALES: Record<FontScale, number> = { S: 0.94, M: 1, L: 1.08 };

export const getTheme = (id: string) =>
  THEMES.find((t) => t.id === id) ?? THEMES[0];
export const getPalette = (id: string) =>
  PALETTES.find((p) => p.id === id) ?? PALETTES[0];
export const getFont = (id: string) => FONTS.find((f) => f.id === id) ?? FONTS[0];
export const isThemeId = (v: unknown): v is ThemeId =>
  THEMES.some((t) => t.id === v);
