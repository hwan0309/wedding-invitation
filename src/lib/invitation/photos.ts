// 샘플·랜딩용 웨딩 사진.
// Unsplash 무료 라이선스(상업적 사용 가능) 사진을 주소로 연결해서 쓴다.
// 실서비스 전에는 직접 촬영했거나 모델 사용 동의가 확인된 사진으로 바꾸는 걸 권장한다(이 파일만 고치면 된다).
import type { ThemeId } from "./types";

const UNSPLASH = {
  veilField: "photo-1546032996-6dfacbacbf3f",
  blossom: "photo-1542680667-4f140360cee3",
  sunsetWalk: "photo-1607190074257-dd4b7af0309f",
  laughing: "photo-1591164473007-703c2c1c4905",
  underTree: "photo-1620315288586-f6cc61c1417a",
  stringLights: "photo-1543932927-a9def13a0e7c",
  windowBride: "photo-1615164825769-b9bbba2906e9",
  garden: "photo-1532107240529-37e00566655d",
  embrace: "photo-1596457221755-b96bc3a6df18",
  lakeDock: "photo-1563808599481-34a342e44508",
  bouquet: "photo-1525258946800-98cfd641d0de",
  walkPark: "photo-1775126964334-93899cb3725a",
  floralArch: "photo-1620315118895-4f3ed831d14d",
  ringHands: "photo-1618566864264-fb013f791da4",
  ringsRoses: "photo-1562249004-1f7289c19c49",
  holdHands: "photo-1561287495-a3fe1fd28504",
  farewell: "photo-1532712938310-34cb3982ef74",
  ringsSilk: "photo-1627293509201-cd0c780043e6",
} as const;

export type PhotoKey = keyof typeof UNSPLASH;

/** 얼굴 위치를 기준으로 자른 사진 주소(h를 주면 그 비율로 잘라 온다) */
export function photo(key: PhotoKey, width = 1080, height?: number) {
  const params = new URLSearchParams({ w: String(width), q: "80", auto: "format", fit: "crop", crop: "faces,center" });
  if (height) params.set("h", String(height));
  return `https://images.unsplash.com/${UNSPLASH[key]}?${params}`;
}

/** 랜딩 첫 화면 슬라이드 */
export const HERO_PHOTOS: PhotoKey[] = ["veilField", "blossom", "stringLights", "sunsetWalk"];

/** 테마별 샘플 대표 사진 */
export const COVER_PHOTO: Record<ThemeId, PhotoKey> = {
  basic: "laughing",
  arch: "underTree",
  poster: "stringLights",
  classic: "windowBride",
  lettering: "blossom",
  minimal: "ringsSilk",
  polaroid: "garden",
  magazine: "embrace",
  circle: "lakeDock",
  sealing: "bouquet",
  film: "walkPark",
  collage: "floralArch",
};

export const GALLERY_PHOTOS: PhotoKey[] = [
  "floralArch",
  "laughing",
  "ringHands",
  "underTree",
  "bouquet",
  "lakeDock",
  "ringsRoses",
  "sunsetWalk",
  "holdHands",
];

export const ENDING_PHOTO: PhotoKey = "farewell";
