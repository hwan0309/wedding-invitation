import {
  IconDuplicate,
  IconEdit,
  IconHeart,
  IconImage,
  IconMessage,
  IconMusic,
  IconPin,
  IconQr,
  IconSparkle,
  IconTalk,
  IconUsers,
} from "@/components/icons";

function IconWon(props: { size?: number }) {
  const size = props.size ?? 22;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10l1.5 4 1.5-4 1.5 4 1.5-4M15.5 12h2" />
    </svg>
  );
}

function IconCalendar(props: { size?: number }) {
  const size = props.size ?? 22;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
      <path d="M12 17s-2.2-1.3-2.2-2.7c0-.8.6-1.3 1.2-1.3.5 0 .8.3 1 .6.2-.3.5-.6 1-.6.6 0 1.2.5 1.2 1.3 0 1.4-2.2 2.7-2.2 2.7z" />
    </svg>
  );
}

const MAP = {
  gallery: IconImage,
  map: IconPin,
  account: IconWon,
  guestbook: IconMessage,
  rsvp: IconUsers,
  calendar: IconCalendar,
  music: IconMusic,
  share: IconTalk,
  qr: IconQr,
  toggle: IconEdit,
  copies: IconDuplicate,
  forever: IconSparkle,
  heart: IconHeart,
} as const;

export function FeatureIcon({ name }: { name: keyof typeof MAP }) {
  const Icon = MAP[name];
  return <Icon size={22} />;
}
