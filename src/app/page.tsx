import Link from "next/link";
import { FeatureIcon } from "@/components/site/FeatureIcons";
import { IconCheck, IconChevronDown, IconChevronRight, IconLink, IconQr, IconTalk } from "@/components/icons";
import { InvitationView } from "@/components/invitation/InvitationView";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";
import { PhoneFrame } from "@/components/site/Phone";
import { SampleCarousel } from "@/components/site/SampleCarousel";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { LIMITS, SITE } from "@/lib/config";
import { createSampleData } from "@/lib/invitation/defaults";
import { HERO_PHOTOS, photo } from "@/lib/invitation/photos";
import { FONTS, PALETTES, THEMES } from "@/lib/invitation/themes";

const HERO_SLIDES = HERO_PHOTOS.map((key) => ({
  mobile: photo(key, 1080, 1920),
  desktop: photo(key, 2000, 1250),
}));

const HIGHLIGHTS = [
  { icon: "toggle", title: "5분이면 완성", desc: "디자인을 고르면 예시 내용이 채워져 있어 고치기만 하면 돼요." },
  { icon: "share", title: "보낸 뒤에도 수정", desc: "이미 공유한 링크와 QR은 그대로, 내용만 최신으로 바뀌어요." },
  {
    icon: "gallery",
    title: `${THEMES.length}가지 디자인`,
    desc: `색상 ${PALETTES.length}가지, 글꼴 ${FONTS.length}가지를 자유롭게 조합하세요.`,
  },
  { icon: "forever", title: "모든 기능 무료", desc: "갤러리·지도·방명록·참석 의사까지 추가 비용이 없어요." },
] as const;

const FEATURES = [
  { icon: "gallery", title: `갤러리 ${LIMITS.galleryMax}장`, desc: "슬라이드·바둑판 배치, 크게 보기와 확대 방지" },
  { icon: "map", title: "지도 · 길찾기", desc: "카카오맵·네이버 지도·티맵 바로 연결" },
  { icon: "account", title: "마음 전하실 곳", desc: "계좌번호 복사, 카카오페이 송금 링크" },
  { icon: "guestbook", title: "방명록", desc: "비밀번호로 작성·삭제, 주인은 언제든 관리" },
  { icon: "rsvp", title: "참석 의사 (RSVP)", desc: "참석 인원·식사 여부 집계와 엑셀 내려받기" },
  { icon: "calendar", title: "D-day 달력", desc: "예식일 달력과 실시간 카운트다운" },
  { icon: "music", title: "배경음악", desc: "음원 업로드, 자동 재생 설정" },
  { icon: "qr", title: "QR 코드", desc: "종이 청첩장에 인쇄해도 링크 그대로" },
] as const;

const FAQ = [
  {
    q: "만든 뒤에도 수정할 수 있나요? 수정하면 다시 보내야 하나요?",
    a: "몇 번이든 자유롭게 수정할 수 있고, 다시 보내지 않으셔도 돼요. 링크 주소는 처음 만든 그대로라서, 수정하고 저장하면 이미 공유한 링크와 인쇄해 둔 QR 코드에서 바로 최신 내용이 보여요.",
  },
  {
    q: "웨딩 사진을 아직 못 받았는데 미리 만들어도 되나요?",
    a: "그럼요. 예시 사진으로 먼저 만들어 두고 나중에 사진만 바꿔 넣으시면 돼요. 링크와 QR 코드는 바뀌지 않으니 종이 청첩장에 QR을 먼저 인쇄해 두셔도 괜찮아요.",
  },
  {
    q: "비용이 드나요?",
    a: "모든 디자인과 기능을 무료로 쓰실 수 있어요. 워터마크도 붙지 않아요.",
  },
  {
    q: "언제까지 볼 수 있나요?",
    a: "사용 기간 제한이 없어요. 예식이 끝나도 직접 삭제하지 않는 한 링크가 계속 살아 있어서 나중에 다시 열어볼 수 있어요.",
  },
  {
    q: "청첩장은 몇 개까지 만들 수 있나요?",
    a: `${LIMITS.invitationsPerOwner}개까지 만들 수 있어요. 본식용과 혼주용을 나누거나, 한국어·영어 버전을 따로 만들어 보세요.`,
  },
  {
    q: "사진은 몇 장까지 올릴 수 있나요?",
    a: `갤러리에는 최대 ${LIMITS.galleryMax}장까지 넣을 수 있어요. 올릴 때 자동으로 용량을 줄여서, 하객분들이 데이터 걱정 없이 빠르게 볼 수 있어요.`,
  },
];

const STEPS = [
  {
    title: "디자인 고르기",
    desc: `${THEMES.length}가지 샘플 중 마음에 드는 디자인을 골라요. 예시 내용이 채워진 채로 시작해요.`,
  },
  { title: "사진 · 문구 넣기", desc: "고치는 즉시 옆 화면에 그대로 보여요. 필요 없는 구성은 켜고 끄면 돼요." },
  {
    title: "카카오톡 · 링크 · QR로 공유",
    desc: "보낸 뒤에도 몇 번이든 고칠 수 있어요. 링크와 QR은 그대로, 내용만 최신으로.",
  },
];

function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-[12px] font-semibold uppercase tracking-[0.32em] ${light ? "text-white/75" : "text-brand"}`}>
      {children}
    </p>
  );
}

export default function Home() {
  const phoneSample = createSampleData("lettering");

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── 첫 화면: 웨딩 사진 ── */}
        <section className="relative isolate flex min-h-[calc(100svh-64px)] items-center justify-center overflow-hidden text-white">
          <HeroSlideshow slides={HERO_SLIDES} />
          <div className="px-6 py-24 text-center">
            <Eyebrow light>Mobile Wedding Invitation</Eyebrow>
            <h1 className="mt-6 font-display text-[58px] font-medium leading-[1] tracking-tight sm:text-[92px]">
              Our Story
              <br />
              Begins
            </h1>
            <div className="mx-auto mt-7 flex w-40 items-center gap-3 text-white/70" aria-hidden>
              <span className="h-px flex-1 bg-current" />
              <span className="h-1.5 w-1.5 rotate-45 bg-current" />
              <span className="h-px flex-1 bg-current" />
            </div>
            <p className="mt-7 text-[17px] leading-relaxed text-white/90 sm:text-[19px]">
              두 사람의 이야기가 시작되는 날,
              <br />
              가장 아름다운 초대장으로 전하세요.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/create"
                className="inline-flex h-14 w-60 items-center justify-center gap-1 rounded-full bg-white text-[16px] font-semibold text-ink shadow-lg transition hover:bg-cream sm:w-auto sm:px-9"
              >
                청첩장 만들기 <IconChevronRight size={18} />
              </Link>
              <Link
                href="/samples"
                className="inline-flex h-14 w-60 items-center justify-center rounded-full border border-white/60 text-[16px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto sm:px-9"
              >
                샘플 둘러보기
              </Link>
            </div>
            <p className="mt-6 text-[13px] text-white/70">무제한 수정 · 평생 소장 · 모든 기능 무료</p>
          </div>
          <a
            href="#samples"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-white/80"
            aria-label="샘플 보기로 이동"
          >
            <IconChevronDown size={30} />
          </a>
        </section>

        {/* ── 소개 ── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="text-center">
            <Eyebrow>Why {SITE.nameEn}</Eyebrow>
            <h2 className="mt-4 text-[28px] font-bold tracking-tight sm:text-[36px]">
              더 쉽게 만들고, 더 오래 간직하세요
            </h2>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="rounded-3xl bg-paper p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand shadow-sm">
                  <FeatureIcon name={h.icon} />
                </span>
                <p className="mt-4 text-lg font-bold">{h.title}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{h.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 샘플 ── */}
        <section id="samples" className="scroll-mt-16 overflow-hidden bg-cream/60 py-20 sm:py-24">
          <div className="px-4 text-center">
            <Eyebrow>Samples</Eyebrow>
            <h2 className="mt-4 text-[28px] font-bold tracking-tight sm:text-[36px]">이런 청첩장을 만들 수 있어요</h2>
            <p className="mt-3 text-[16px] text-ink-soft">좌우로 넘기며 {THEMES.length}가지 디자인을 둘러보세요</p>
          </div>
          <div className="mt-10">
            <SampleCarousel />
          </div>
        </section>

        {/* ── 3단계 ── */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="mx-auto w-full max-w-[330px]">
            <PhoneFrame>
              <InvitationView data={phoneSample} mode="sample" />
            </PhoneFrame>
            <p className="mt-4 text-center text-[13px] text-muted">화면 안을 스크롤해서 넘겨보세요</p>
          </div>
          <div>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-4 text-[28px] font-bold leading-snug tracking-tight sm:text-[36px]">
              우리만의 초대,
              <br />
              3단계로 끝
            </h2>
            <ol className="mt-10 space-y-8">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span className="font-display text-[34px] font-medium leading-none text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-lg font-bold">{step.title}</p>
                    <p className="mt-1.5 leading-relaxed text-ink-soft">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap gap-2 text-sm">
              {[
                { icon: <IconTalk size={15} />, label: "카카오톡" },
                { icon: <IconLink size={15} />, label: "링크 복사" },
                { icon: <IconQr size={15} />, label: "QR 코드" },
              ].map((s) => (
                <span key={s.label} className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3.5 py-2 text-ink-soft">
                  {s.icon}
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 기능 ── */}
        <section className="bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
            <Eyebrow>Features</Eyebrow>
            <h2 className="mt-4 text-[28px] font-bold tracking-tight sm:text-[36px]">필요한 기능은 모두 기본으로</h2>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <li key={f.title} className="bg-white p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                    <FeatureIcon name={f.icon} />
                  </span>
                  <p className="mt-4 font-bold">{f.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{f.desc}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-center gap-1.5 text-sm text-ink-soft">
              <IconCheck size={16} strokeWidth={2.4} className="text-free" />
              섹션마다 켜고 끌 수 있어서 필요한 구성만 담을 수 있어요.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-4 text-[28px] font-bold tracking-tight sm:text-[36px]">자주 묻는 질문</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper text-muted transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 pr-10 leading-relaxed text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── 마무리 ── */}
        <section className="relative isolate overflow-hidden px-4 py-28 text-center text-white sm:py-36">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo("sunsetWalk", 2000, 1100)}
            alt=""
            loading="lazy"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-black/45" aria-hidden />
          <p className="font-display text-[22px] italic text-white/85">With love, always</p>
          <h2 className="mt-4 text-[28px] font-bold leading-snug tracking-tight sm:text-[38px]">
            가장 소중한 날의 첫 소식,
            <br />
            지금 시작해 보세요
          </h2>
          <Link
            href="/create"
            className="mt-10 inline-flex h-14 items-center gap-1 rounded-full bg-white px-9 text-[16px] font-semibold text-ink transition hover:bg-cream"
          >
            청첩장 만들기 <IconChevronRight size={18} />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
