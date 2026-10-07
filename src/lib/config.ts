// 서비스 이름·한도 등 전역 설정. 서비스명은 임시이며 여기서만 바꾸면 된다.
export const SITE = {
  name: "다솜",
  nameEn: "dasom",
  tagline: "소중한 날을 담는 모바일 청첩장",
  description:
    "12가지 디자인으로 만드는 모바일 청첩장. 보낸 뒤에도 언제든 수정하고 평생 간직하세요. 모든 기능 무료.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const LIMITS = {
  invitationsPerOwner: 3,
  galleryMax: 30,
  imageMaxBytes: 20 * 1024 * 1024,
  audioMaxBytes: 20 * 1024 * 1024,
  guestbookNameMax: 10,
  guestbookMessageMax: 100,
};

// 카카오 JavaScript 키(지도 + 카카오톡 공유 공용). 없으면 해당 기능은 대체 UI로 동작한다.
export const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "";
