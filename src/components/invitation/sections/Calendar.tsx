"use client";

import { IconHeartFill } from "@/components/icons";
import {
  MONTHS_EN,
  WEEKDAYS_KO,
  daysUntil,
  formatDateKo,
  formatTimeKo,
  monthMatrix,
  parseYMD,
  weddingInstant,
} from "@/lib/invitation/date";
import { useInvitation, useNow } from "../context";
import { Reveal, SectionTitle } from "../ui";

function Countdown() {
  const { data } = useInvitation();
  const now = useNow(1000);
  const target = weddingInstant(data.wedding.date, data.wedding.time);
  const left = now !== null && target !== null ? Math.max(0, target - now) : null;
  const units = [
    { label: "DAYS", value: left === null ? null : Math.floor(left / 86_400_000) },
    { label: "HOUR", value: left === null ? null : Math.floor(left / 3_600_000) % 24 },
    { label: "MIN", value: left === null ? null : Math.floor(left / 60_000) % 60 },
    { label: "SEC", value: left === null ? null : Math.floor(left / 1000) % 60 },
  ];

  const days = now === null ? null : daysUntil(data.wedding.date, now);
  const couple = `${data.groom.firstName || "신랑"} ♥ ${data.bride.firstName || "신부"}`;
  let message = "";
  if (days !== null) {
    if (days > 0) message = `의 결혼식이 ${days}일 남았습니다.`;
    else if (days === 0) message = "의 결혼식 날입니다.";
    else message = `의 결혼식이 ${-days}일 지났습니다.`;
  }

  return (
    <div className="inv-countdown">
      <div className="inv-countdown__units">
        {units.map((u, i) => (
          <div key={u.label} className="inv-countdown__unit">
            {i > 0 && <span className="inv-countdown__colon">:</span>}
            <div>
              <strong>{u.value === null ? "-" : String(u.value).padStart(2, "0")}</strong>
              <span>{u.label}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="inv-countdown__msg">
        {message && (
          <>
            <em>{couple}</em>
            {message}
          </>
        )}
      </p>
    </div>
  );
}

export function CalendarSection() {
  const { data } = useInvitation();
  const ymd = parseYMD(data.wedding.date);
  if (!ymd) return null;
  const weeks = monthMatrix(ymd.y, ymd.m);

  return (
    <section className="inv-section inv-section--surface inv-calendar">
      <Reveal>
        <SectionTitle en="Wedding Day" ko="예식 일시" />
        <p className="inv-calendar__when">
          {formatDateKo(data.wedding.date)}
          <br />
          {formatTimeKo(data.wedding.time)}
        </p>
      </Reveal>
      <Reveal>
        <div className="inv-cal">
          <p className="inv-cal__month">
            <span>{MONTHS_EN[ymd.m - 1]}</span> {ymd.y}
          </p>
          <table>
            <thead>
              <tr>
                {WEEKDAYS_KO.map((w, i) => (
                  <th key={w} className={i === 0 ? "is-sun" : undefined}>
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, wi) => (
                <tr key={wi}>
                  {week.map((d, di) => (
                    <td key={di} className={di === 0 ? "is-sun" : undefined}>
                      {d === ymd.d ? (
                        <span className="inv-cal__day is-wedding">
                          {d}
                          <IconHeartFill size={9} />
                        </span>
                      ) : (
                        d && <span className="inv-cal__day">{d}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.calendar.countdown && <Countdown />}
      </Reveal>
    </section>
  );
}
