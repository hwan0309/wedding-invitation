/** 외부 스크립트를 한 번만 불러온다. */
export function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded) return resolve();
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => {
      script.dataset.loaded = "1";
      resolve();
    });
    script.addEventListener("error", () => reject(new Error(`failed to load ${src}`)));
    if (!existing) {
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

interface DaumPostcodeResult {
  address: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeResult) => void;
        width?: string;
        height?: string;
      }) => { embed(element: HTMLElement): void };
    };
  }
}

/** 카카오(다음) 우편번호 서비스 — API 키 없이 무료로 쓸 수 있다. */
export async function embedAddressSearch(
  element: HTMLElement,
  onSelect: (address: string, buildingName: string) => void,
) {
  await loadScript("https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js");
  new window.daum!.Postcode({
    width: "100%",
    height: "100%",
    oncomplete: (data) =>
      onSelect(data.roadAddress || data.jibunAddress || data.address, data.buildingName),
  }).embed(element);
}
