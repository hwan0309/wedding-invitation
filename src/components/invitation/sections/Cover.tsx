"use client";

import { useId } from "react";
import { IconHeart } from "@/components/icons";
import {
  formatDateDots,
  formatDateKo,
  formatTimeEn,
  formatTimeKo,
  parseYMD,
  weekdayEn,
  weekdayEnFull,
} from "@/lib/invitation/date";
import { fullName } from "@/lib/invitation/defaults";
import { useInvitation } from "../context";
import { Photo } from "../ui";

function useCoverText() {
  const { data } = useInvitation();
  const ymd = parseYMD(data.wedding.date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    data,
    groom: fullName(data.groom) || "신랑",
    bride: fullName(data.bride) || "신부",
    groomFirst: data.groom.firstName || "신랑",
    brideFirst: data.bride.firstName || "신부",
    year: ymd ? String(ymd.y) : "",
    month: ymd ? pad(ymd.m) : "--",
    day: ymd ? pad(ymd.d) : "--",
    dateKo: formatDateKo(data.wedding.date),
    timeKo: formatTimeKo(data.wedding.time),
    dateDots: formatDateDots(data.wedding.date),
    weekday: weekdayEn(data.wedding.date),
    weekdayFull: weekdayEnFull(data.wedding.date),
    timeEn: formatTimeEn(data.wedding.time),
    venue: data.venue.enabled ? `${data.venue.name} ${data.venue.hall}`.trim() : "",
  };
}

function CoverBasic() {
  const t = useCoverText();
  return (
    <section className="inv-cover inv-cover--basic">
      <p className="inv-cover__kicker">{t.data.main.kicker}</p>
      <p className="inv-cover__date">
        {t.month}
        <span aria-hidden>•</span>
        {t.day}
      </p>
      <Photo src={t.data.main.photo} className="inv-cover__photo" eager />
      <p className="inv-cover__names">
        <span>{t.groom}</span>
        <IconHeart size={16} />
        <span>{t.bride}</span>
      </p>
      <p className="inv-cover__meta">
        {t.dateKo} {t.timeKo}
        {t.venue && <br />}
        {t.venue}
      </p>
    </section>
  );
}

function CoverArch() {
  const t = useCoverText();
  return (
    <section className="inv-cover inv-cover--arch">
      <div className="inv-arch">
        <Photo src={t.data.main.photo} eager />
      </div>
      <p className="inv-cover__kicker">{t.data.main.kicker}</p>
      <h1 className="inv-cover__names">
        {t.groom}
        <span aria-hidden>&amp;</span>
        {t.bride}
      </h1>
      <p className="inv-cover__meta">
        {t.dateDots} {t.weekday} {t.timeEn}
        {t.venue && <br />}
        {t.venue}
      </p>
    </section>
  );
}

function CoverPoster() {
  const t = useCoverText();
  return (
    <section className="inv-cover inv-cover--poster">
      <Photo src={t.data.main.photo} className="inv-poster__bg" eager />
      <div className="inv-poster__shade" aria-hidden />
      <p className="inv-poster__top">{t.data.main.kicker}</p>
      <div className="inv-poster__bottom">
        <h1 className="inv-poster__names">
          {t.groomFirst}
          <em>and</em>
          {t.brideFirst}
        </h1>
        <p className="inv-poster__date">
          {t.dateDots} {t.weekday} · {t.timeEn}
        </p>
        {t.venue && <p className="inv-poster__venue">{t.venue}</p>}
      </div>
    </section>
  );
}

function CoverClassic() {
  const t = useCoverText();
  return (
    <section className="inv-cover inv-cover--classic">
      <div className="inv-classic">
        <p className="inv-cover__kicker">{t.data.main.kicker}</p>
        <h1 className="inv-cover__names">
          <span>{t.groom}</span>
          <small>and</small>
          <span>{t.bride}</span>
        </h1>
        <div className="inv-classic__photo">
          <Photo src={t.data.main.photo} eager />
        </div>
        <p className="inv-classic__date">
          {t.dateDots} {t.weekday}
        </p>
        <p className="inv-cover__meta">
          {t.timeKo}
          {t.venue && <br />}
          {t.venue}
        </p>
      </div>
    </section>
  );
}

function CoverLettering() {
  const t = useCoverText();
  return (
    <section className="inv-cover inv-cover--lettering">
      <div className="inv-lettering">
        <Photo src={t.data.main.photo} eager />
        <p className="inv-lettering__text">{t.data.main.kicker}</p>
      </div>
      <p className="inv-cover__names">
        {t.groom}
        <span aria-hidden>·</span>
        {t.bride}
      </p>
      <p className="inv-cover__meta">
        {t.dateKo} {t.timeKo}
        {t.venue && <br />}
        {t.venue}
      </p>
    </section>
  );
}

/** 사진 없이 날짜만 크게 */
function CoverMinimal() {
  const t = useCoverText();
  return (
    <section className="inv-cover inv-cover--minimal">
      <div className="inv-minimal">
        <p className="inv-cover__kicker">{t.data.main.kicker}</p>
        <p className="inv-minimal__year">{t.year}</p>
        <p className="inv-minimal__date">
          <span>{t.month}</span>
          <span className="inv-minimal__dot" aria-hidden>
            ·
          </span>
          <span>{t.day}</span>
        </p>
        <p className="inv-minimal__when">
          {t.weekdayFull} · {t.timeEn}
        </p>
        <span className="inv-minimal__rule" aria-hidden />
        <p className="inv-cover__names">
          {t.groom}
          <span aria-hidden>·</span>
          {t.bride}
        </p>
        {t.venue && <p className="inv-cover__meta">{t.venue}</p>}
      </div>
    </section>
  );
}

function CoverPolaroid() {
  const t = useCoverText();
  return (
    <section className="inv-cover inv-cover--polaroid">
      <p className="inv-cover__kicker">{t.data.main.kicker}</p>
      <figure className="inv-polaroid">
        <span className="inv-polaroid__tape" aria-hidden />
        <Photo src={t.data.main.photo} eager />
        <figcaption>{t.dateDots} ♡</figcaption>
      </figure>
      <p className="inv-cover__names">
        {t.groomFirst}
        <span aria-hidden>그리고</span>
        {t.brideFirst}
      </p>
      <p className="inv-cover__meta">
        {t.dateKo} {t.timeKo}
        {t.venue && <br />}
        {t.venue}
      </p>
    </section>
  );
}

function CoverMagazine() {
  const t = useCoverText();
  return (
    <section className="inv-cover inv-cover--magazine">
      <div className="inv-mag__head">
        <span>{t.year} Wedding Issue</span>
        <span>{t.dateDots}</span>
      </div>
      <h1 className="inv-mag__title">{t.data.main.kicker}</h1>
      <div className="inv-mag__photo">
        <Photo src={t.data.main.photo} eager />
        <span className="inv-mag__side">
          {t.weekdayFull} · {t.timeEn}
        </span>
      </div>
      <div className="inv-mag__foot">
        <p className="inv-mag__names">
          {t.groom}
          <em>&amp;</em>
          {t.bride}
        </p>
        {t.venue && <p className="inv-cover__meta">{t.venue}</p>}
      </div>
    </section>
  );
}

/** 둥근 사진 둘레를 문장이 감싼다 */
function CoverCircle() {
  const t = useCoverText();
  // 한 페이지에 썸네일이 여러 개 그려져도 겹치지 않는 SVG id
  const pathId = `ring${useId().replace(/[^\w-]/g, "")}`;
  const ring = `${t.data.main.kicker} · ${t.groomFirst} & ${t.brideFirst} · ${t.dateDots} · `;
  return (
    <section className="inv-cover inv-cover--circle">
      <div className="inv-circle">
        <svg className="inv-circle__ring" viewBox="0 0 300 300" aria-hidden>
          <defs>
            <path id={pathId} d="M150,150 m-136,0 a136,136 0 1,1 272,0 a136,136 0 1,1 -272,0" />
          </defs>
          <text>
            <textPath href={`#${pathId}`} textLength={850} lengthAdjust="spacing">
              {ring}
            </textPath>
          </text>
        </svg>
        <div className="inv-circle__photo">
          <Photo src={t.data.main.photo} eager />
        </div>
      </div>
      <p className="inv-cover__names">
        {t.groom}
        <IconHeart size={14} />
        {t.bride}
      </p>
      <p className="inv-cover__meta">
        {t.dateKo} {t.timeKo}
        {t.venue && <br />}
        {t.venue}
      </p>
    </section>
  );
}

/** 봉투와 실링 왁스 */
function CoverSealing() {
  const t = useCoverText();
  return (
    <section className="inv-cover inv-cover--sealing">
      <div className="inv-envelope">
        <span className="inv-envelope__flap" aria-hidden />
        <span className="inv-seal" aria-hidden>
          <span>&amp;</span>
        </span>
        <p className="inv-cover__kicker">{t.data.main.kicker}</p>
        <p className="inv-cover__names">
          {t.groom}
          <span aria-hidden>·</span>
          {t.bride}
        </p>
        <p className="inv-cover__meta">
          {t.dateKo} {t.timeKo}
          {t.venue && <br />}
          {t.venue}
        </p>
      </div>
      <div className="inv-sealing__photo">
        <Photo src={t.data.main.photo} eager />
      </div>
    </section>
  );
}

/** 필름 스트립 + 날짜 스탬프 */
function CoverFilm() {
  const t = useCoverText();
  return (
    <section className="inv-cover inv-cover--film">
      <p className="inv-film__label">
        <span>{t.data.main.kicker}</span>
        <span>▸ 36</span>
      </p>
      <div className="inv-film">
        <div className="inv-film__frame">
          <Photo src={t.data.main.photo} eager />
          <span className="inv-film__stamp">
            &apos;{t.year.slice(2)} {t.month} {t.day}
          </span>
        </div>
      </div>
      <p className="inv-cover__names">
        {t.groomFirst}
        <span aria-hidden>♥</span>
        {t.brideFirst}
      </p>
      <p className="inv-cover__meta">
        {t.dateKo} {t.timeKo}
        {t.venue && <br />}
        {t.venue}
      </p>
    </section>
  );
}

/** 대표 사진 + 갤러리 앞 두 장 */
function CoverCollage() {
  const t = useCoverText();
  // 대표 사진과 겹치지 않는 갤러리 사진 두 장
  const [first, second] = t.data.gallery.images.filter((src) => src !== t.data.main.photo);
  return (
    <section className="inv-cover inv-cover--collage">
      <div className="inv-collage">
        <Photo src={t.data.main.photo} className="inv-collage__a" eager />
        <Photo src={first ?? t.data.main.photo} className="inv-collage__b" />
        <Photo src={second ?? t.data.main.photo} className="inv-collage__c" />
        <span className="inv-collage__badge">
          <b>
            {t.month}.{t.day}
          </b>
          <small>{t.weekday}</small>
        </span>
      </div>
      <p className="inv-cover__kicker">{t.data.main.kicker}</p>
      <p className="inv-cover__names">
        {t.groom}
        <span aria-hidden>&amp;</span>
        {t.bride}
      </p>
      <p className="inv-cover__meta">
        {t.dateKo} {t.timeKo}
        {t.venue && <br />}
        {t.venue}
      </p>
    </section>
  );
}

export function Cover() {
  const { data } = useInvitation();
  switch (data.design.theme) {
    case "arch":
      return <CoverArch />;
    case "poster":
      return <CoverPoster />;
    case "classic":
      return <CoverClassic />;
    case "lettering":
      return <CoverLettering />;
    case "minimal":
      return <CoverMinimal />;
    case "polaroid":
      return <CoverPolaroid />;
    case "magazine":
      return <CoverMagazine />;
    case "circle":
      return <CoverCircle />;
    case "sealing":
      return <CoverSealing />;
    case "film":
      return <CoverFilm />;
    case "collage":
      return <CoverCollage />;
    default:
      return <CoverBasic />;
  }
}
