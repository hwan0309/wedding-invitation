// 클라이언트 컴포넌트에서도 쓰는 타입(서버 전용 코드 없음)
export type LoginProvider = "kakao" | "google" | "dev";

/** 화면·서버 액션에서 쓰는 로그인 사용자(필요한 필드만) */
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image: string;
  provider: LoginProvider;
}

export const PROVIDER_LABEL: Record<LoginProvider, string> = {
  kakao: "카카오",
  google: "Google",
  dev: "테스트",
};
