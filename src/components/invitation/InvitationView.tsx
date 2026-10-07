"use client";

import "./invitation.css";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  DISPLAY_FONT_HREF,
  FONT_SCALES,
  getFont,
  getPalette,
} from "@/lib/invitation/themes";
import type { InvitationData, ViewMode } from "@/lib/invitation/types";
import { InvitationContext, useHydrated } from "./context";
import { Account } from "./sections/Account";
import { CalendarSection } from "./sections/Calendar";
import { Bgm, Ending, ShareFooter } from "./sections/Closing";
import { Cover } from "./sections/Cover";
import { Gallery } from "./sections/Gallery";
import { Greeting } from "./sections/Greeting";
import { Guestbook } from "./sections/Guestbook";
import { Location } from "./sections/Location";
import { Notice } from "./sections/Notice";
import { Rsvp } from "./sections/Rsvp";
import { LayerContext, cx } from "./ui";

interface Props {
  data: InvitationData;
  mode: ViewMode;
  invitationId?: string | null;
  /** 커버만 렌더링(테마 썸네일용) */
  coverOnly?: boolean;
  className?: string;
}

/**
 * 청첩장 화면. 하객용 페이지·편집기 미리보기·샘플·테마 썸네일이 모두 이 컴포넌트를 쓴다.
 * 그래서 편집 중 보이는 미리보기와 실제 링크의 화면이 항상 같다.
 */
export function InvitationView({ data, mode, invitationId = null, coverOnly, className }: Props) {
  const palette = getPalette(data.design.palette);
  const font = getFont(data.design.font);
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // 스크롤 등장 효과는 JS가 준비된 뒤에만 켠다(JS 없이도 내용이 보이도록).
  const animate = useHydrated();

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const toast = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2200);
  }, []);

  const style = {
    "--inv-bg": palette.bg,
    "--inv-surface": palette.surface,
    "--inv-text": palette.text,
    "--inv-sub": palette.sub,
    "--inv-accent": palette.accent,
    "--inv-line": palette.line,
    "--inv-on-accent": palette.onAccent,
    "--inv-font": font.family,
    "--inv-scale": FONT_SCALES[data.design.fontScale] * font.sizeAdjust,
  } as CSSProperties;

  return (
    <InvitationContext.Provider value={{ data, mode, invitationId, thumbnail: Boolean(coverOnly), toast }}>
      <LayerContext.Provider value={layer}>
        <link rel="stylesheet" href={font.href} precedence="default" />
        <link rel="stylesheet" href={DISPLAY_FONT_HREF} precedence="default" />
        <div
          className={cx("inv", className)}
          data-theme={data.design.theme}
          data-tone={palette.id === "midnight" ? "dark" : "light"}
          data-anim={animate && !coverOnly ? "" : undefined}
          data-zoomlock={data.gallery.preventZoom ? "" : undefined}
          style={style}
        >
          <Cover />
          {!coverOnly && (
            <>
              {data.greeting.enabled && <Greeting />}
              {data.calendar.enabled && <CalendarSection />}
              {data.gallery.enabled && data.gallery.images.length > 0 && <Gallery />}
              {data.venue.enabled && <Location />}
              {data.notice.enabled && data.notice.items.length > 0 && <Notice />}
              {data.account.enabled && <Account />}
              {data.guestbook.enabled && <Guestbook />}
              {data.rsvp.enabled && <Rsvp />}
              {data.ending.enabled && <Ending />}
              <ShareFooter />
              {data.bgm.enabled && data.bgm.src && <Bgm />}
            </>
          )}
          <div ref={setLayer} className="inv-layer" />
          {toastMessage && (
            <div className="inv-toast" role="status">
              {toastMessage}
            </div>
          )}
        </div>
      </LayerContext.Provider>
    </InvitationContext.Provider>
  );
}
