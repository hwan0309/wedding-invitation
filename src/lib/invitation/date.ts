// 예식 날짜·시간은 'YYYY-MM-DD' / 'HH:mm'(한국 시간) 문자열로 저장하고,
// 표시할 때도 UTC 연산만 사용한다. 하객의 기기 시간대와 무관하게 같은 날짜가 보인다.

export interface YMD {
  y: number;
  m: number;
  d: number;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];
export const WEEKDAYS_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const daysInMonth = (y: number, m: number) =>
  new Date(Date.UTC(y, m, 0)).getUTCDate();

export function parseYMD(date: string): YMD | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

export function parseHM(time: string): { h: number; min: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const h = Number(match[1]);
  const min = Number(match[2]);
  if (h > 23 || min > 59) return null;
  return { h, min };
}

export const weekdayOf = ({ y, m, d }: YMD) =>
  new Date(Date.UTC(y, m - 1, d)).getUTCDay();

const pad = (n: number) => String(n).padStart(2, "0");

/** 2027년 5월 15일 토요일 */
export function formatDateKo(date: string, withWeekday = true) {
  const ymd = parseYMD(date);
  if (!ymd) return "";
  const base = `${ymd.y}년 ${ymd.m}월 ${ymd.d}일`;
  return withWeekday ? `${base} ${WEEKDAYS_KO[weekdayOf(ymd)]}요일` : base;
}

/** 2027. 05. 15 */
export function formatDateDots(date: string) {
  const ymd = parseYMD(date);
  return ymd ? `${ymd.y}. ${pad(ymd.m)}. ${pad(ymd.d)}` : "";
}

/** 오후 12시 30분 */
export function formatTimeKo(time: string) {
  const t = parseHM(time);
  if (!t) return "";
  const ampm = t.h < 12 ? "오전" : "오후";
  const h12 = t.h % 12 === 0 ? 12 : t.h % 12;
  return `${ampm} ${h12}시${t.min ? ` ${t.min}분` : ""}`;
}

/** 12:30 PM */
export function formatTimeEn(time: string) {
  const t = parseHM(time);
  if (!t) return "";
  const h12 = t.h % 12 === 0 ? 12 : t.h % 12;
  return `${h12}:${pad(t.min)} ${t.h < 12 ? "AM" : "PM"}`;
}

export function weekdayEn(date: string) {
  const ymd = parseYMD(date);
  return ymd ? WEEKDAYS_EN[weekdayOf(ymd)] : "";
}

const WEEKDAYS_EN_FULL = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

/** SATURDAY */
export function weekdayEnFull(date: string) {
  const ymd = parseYMD(date);
  return ymd ? WEEKDAYS_EN_FULL[weekdayOf(ymd)] : "";
}

/** 한국 시간 기준 예식 시각(epoch ms). 카운트다운 계산용. */
export function weddingInstant(date: string, time: string): number | null {
  const ymd = parseYMD(date);
  if (!ymd) return null;
  const t = parseHM(time) ?? { h: 0, min: 0 };
  return Date.UTC(ymd.y, ymd.m - 1, ymd.d, t.h, t.min) - KST_OFFSET_MS;
}

/** 한국 달력 기준으로 예식일까지 남은 일수(당일 0, 지났으면 음수). */
export function daysUntil(date: string, now: number): number | null {
  const ymd = parseYMD(date);
  if (!ymd) return null;
  const kst = new Date(now + KST_OFFSET_MS);
  const today = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  return Math.round((Date.UTC(ymd.y, ymd.m - 1, ymd.d) - today) / DAY_MS);
}

/** 달력 그리드(주 단위, 빈 칸은 null) */
export function monthMatrix(y: number, m: number): (number | null)[][] {
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const cells: (number | null)[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= daysInMonth(y, m); d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
