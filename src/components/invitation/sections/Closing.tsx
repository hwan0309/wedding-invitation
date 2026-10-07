"use client";

import { useEffect, useRef, useState } from "react";
import { IconLink, IconMusic, IconMusicOff, IconTalk } from "@/components/icons";
import { SITE } from "@/lib/config";
import { shareMeta } from "@/lib/invitation/defaults";
import { hasKakaoKey, loadKakaoSdk } from "@/lib/kakao";
import { copyText, useInvitation } from "../context";
import { Photo, Reveal } from "../ui";

export function Ending() {
  const { data } = useInvitation();
  return (
    <section className="inv-section inv-ending">
      {data.ending.photo && (
        <Reveal>
          <Photo src={data.ending.photo} className="inv-ending__photo" />
        </Reveal>
      )}
      <Reveal>
        <p className="inv-ending__script">Thank you</p>
        <p className="inv-text">{data.ending.message}</p>
      </Reveal>
    </section>
  );
}

const absolute = (path: string) => new URL(path, window.location.origin).toString();

export function ShareFooter() {
  const { data, mode, invitationId, toast } = useInvitation();

  const pageUrl = () =>
    invitationId ? absolute(`/i/${invitationId}`) : window.location.href;

  const blocked = () => {
    if (mode !== "preview") return false;
    toast("미리보기에서는 공유되지 않아요. 상단의 ‘링크 복사’를 이용해 주세요.");
    return true;
  };

  const copyLink = async () => {
    if (blocked()) return;
    toast((await copyText(pageUrl())) ? "청첩장 링크를 복사했어요." : "복사하지 못했어요.");
  };

  const share = async () => {
    if (blocked()) return;
    const meta = shareMeta(data);
    const url = pageUrl();
    if (hasKakaoKey()) {
      try {
        const kakao = await loadKakaoSdk();
        kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: meta.title,
            description: meta.description,
            imageUrl: meta.image ? absolute(meta.image) : undefined,
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [{ title: "청첩장 보기", link: { mobileWebUrl: url, webUrl: url } }],
        });
        return;
      } catch {
        // SDK를 불러오지 못하면 아래 기본 공유로 넘어간다.
      }
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: meta.title, text: meta.description, url });
        return;
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
    }
    await copyLink();
  };

  return (
    <footer className="inv-share">
      <button type="button" className="inv-share__btn is-kakao" onClick={share}>
        <IconTalk size={18} /> 카카오톡으로 공유하기
      </button>
      <button type="button" className="inv-share__btn" onClick={copyLink}>
        <IconLink size={18} /> 청첩장 링크 복사하기
      </button>
      <p className="inv-credit">
        <a href="/" target="_blank" rel="noreferrer">
          {SITE.name}
        </a>
        에서 무료로 만든 모바일 청첩장
      </p>
    </footer>
  );
}

export function Bgm() {
  const { data, mode } = useInvitation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(false);

  // 자동 재생: 브라우저가 막으면 하객이 화면을 처음 터치할 때 재생한다.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || mode !== "live" || !data.bgm.autoplay) return;
    const start = (e: Event) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      audio.play().catch(() => undefined);
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
    audio.play().catch(() => {
      window.addEventListener("pointerdown", start);
      window.addEventListener("keydown", start);
    });
    return cleanup;
  }, [mode, data.bgm.autoplay, data.bgm.src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => undefined);
    else audio.pause();
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={data.bgm.src}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        ref={buttonRef}
        type="button"
        className="inv-bgm"
        aria-label={playing ? "배경음악 끄기" : "배경음악 켜기"}
        aria-pressed={playing}
        onClick={toggle}
      >
        {playing ? <IconMusic size={18} /> : <IconMusicOff size={18} />}
      </button>
    </>
  );
}
