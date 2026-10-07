// 카카오 지도 / 카카오톡 공유 SDK 로더. NEXT_PUBLIC_KAKAO_JS_KEY 가 있을 때만 사용한다.
import { KAKAO_JS_KEY } from "./config";
import { loadScript } from "./script";

interface LatLng {
  readonly __brand?: "LatLng";
}
interface KakaoMaps {
  load(callback: () => void): void;
  LatLng: new (lat: number, lng: number) => LatLng;
  Map: new (
    container: HTMLElement,
    options: { center: LatLng; level: number },
  ) => { setCenter(center: LatLng): void };
  Marker: new (options: { map: unknown; position: LatLng }) => unknown;
  services: {
    Geocoder: new () => {
      addressSearch(
        address: string,
        callback: (result: { x: string; y: string }[], status: string) => void,
      ): void;
    };
    Status: { OK: string };
  };
}
interface KakaoSdk {
  init(key: string): void;
  isInitialized(): boolean;
  Share: { sendDefault(settings: Record<string, unknown>): void };
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps };
    Kakao?: KakaoSdk;
  }
}

export const hasKakaoKey = () => Boolean(KAKAO_JS_KEY);

export async function loadKakaoMaps(): Promise<KakaoMaps> {
  await loadScript(
    `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`,
  );
  const maps = window.kakao!.maps;
  await new Promise<void>((resolve) => maps.load(resolve));
  return maps;
}

export async function loadKakaoSdk(): Promise<KakaoSdk> {
  await loadScript("https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js");
  const sdk = window.Kakao!;
  if (!sdk.isInitialized()) sdk.init(KAKAO_JS_KEY);
  return sdk;
}

/** 길찾기 앱 링크(주소 검색 기반이라 좌표 없이도 동작) */
export function navigationLinks(query: string) {
  const q = encodeURIComponent(query);
  return {
    kakao: `https://map.kakao.com/link/search/${q}`,
    naver: `https://map.naver.com/p/search/${q}`,
    tmap: `tmap://search?name=${q}`,
  };
}
