"use client";

import { useTransition } from "react";
import { deleteGuestbookAsOwner } from "@/app/actions";
import { IconTrash } from "@/components/icons";
import { useToast } from "@/components/site/Dialog";
import { formatKstDate } from "@/components/site/hooks";
import type { GuestbookItem } from "@/lib/invitation/guest";

export interface RsvpRow {
  id: string;
  side: "groom" | "bride";
  attending: boolean;
  name: string;
  companions: number;
  meal: "yes" | "no" | "undecided";
  phone: string;
  message: string;
  createdAt: string;
}

const SIDE = { groom: "신랑측", bride: "신부측" } as const;
const MEAL = { yes: "예정", no: "안 함", undecided: "미정" } as const;

function summarize(rows: RsvpRow[]) {
  const attending = rows.filter((r) => r.attending);
  const people = (list: RsvpRow[]) => list.reduce((sum, r) => sum + 1 + r.companions, 0);
  return {
    responses: rows.length,
    attendingPeople: people(attending),
    declined: rows.length - attending.length,
    mealPeople: people(attending.filter((r) => r.meal === "yes")),
    groomPeople: people(attending.filter((r) => r.side === "groom")),
    bridePeople: people(attending.filter((r) => r.side === "bride")),
  };
}

function downloadCsv(rows: RsvpRow[], filename: string) {
  const header = ["구분", "참석", "성함", "동행 인원", "식사", "연락처", "메시지", "응답일"];
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [SIDE[r.side], r.attending ? "참석" : "불참", r.name, r.companions, r.attending ? MEAL[r.meal] : "-", r.phone, r.message, formatKstDate(r.createdAt)]
      .map(escape)
      .join(","),
  );
  // 엑셀에서 한글이 깨지지 않도록 BOM을 붙인다.
  const blob = new Blob(["﻿" + [header.map(escape).join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function Responses({
  invitationId,
  rsvp,
  guestbook,
}: {
  invitationId: string;
  rsvp: RsvpRow[];
  guestbook: GuestbookItem[];
}) {
  const { show, node } = useToast();
  const [pending, startTransition] = useTransition();
  const s = summarize(rsvp);

  const stats = [
    { label: "참석 예정 인원", value: `${s.attendingPeople}명`, sub: `신랑측 ${s.groomPeople} · 신부측 ${s.bridePeople}` },
    { label: "식사 예정 인원", value: `${s.mealPeople}명`, sub: "동행 인원 포함" },
    { label: "불참 응답", value: `${s.declined}건`, sub: `전체 응답 ${s.responses}건` },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold">참석 의사</h2>
          {rsvp.length > 0 && (
            <button
              type="button"
              onClick={() => downloadCsv(rsvp, `rsvp-${invitationId}.csv`)}
              className="rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-soft hover:border-ink/25"
            >
              엑셀(CSV)로 받기
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {stats.map((st) => (
            <div key={st.label} className="rounded-2xl bg-white p-5 ring-1 ring-line">
              <p className="text-[13px] text-muted">{st.label}</p>
              <p className="mt-1 text-2xl font-bold">{st.value}</p>
              <p className="mt-0.5 text-[12px] text-muted">{st.sub}</p>
            </div>
          ))}
        </div>
        {rsvp.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-white px-5 py-10 text-center text-sm text-muted ring-1 ring-line">
            아직 응답이 없어요. 청첩장을 공유하면 하객 응답이 여기에 모여요.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-[12px] text-muted">
                <tr>
                  {["구분", "성함", "참석", "동행", "식사", "연락처", "메시지", "응답일"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rsvp.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-muted">{SIDE[r.side]}</td>
                    <td className="px-4 py-3 font-semibold">{r.name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${r.attending ? "bg-free-soft text-free" : "bg-paper text-muted"}`}>
                        {r.attending ? "참석" : "불참"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.attending ? `${r.companions}명` : "-"}</td>
                    <td className="px-4 py-3">{r.attending ? MEAL[r.meal] : "-"}</td>
                    <td className="px-4 py-3 text-muted">{r.phone || "-"}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted" title={r.message}>
                      {r.message || "-"}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatKstDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold">방명록</h2>
        <p className="mt-1 text-sm text-muted">부적절한 글은 여기서 바로 지울 수 있어요.</p>
        {guestbook.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-white px-5 py-10 text-center text-sm text-muted ring-1 ring-line">아직 방명록이 없어요.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {guestbook.map((g) => (
              <li key={g.id} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <strong>{g.name}</strong> <span className="ml-1 text-[12px] text-muted">{formatKstDate(g.createdAt)}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink-soft">{g.message}</p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  aria-label="삭제"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteGuestbookAsOwner(invitationId, g.id);
                      show(result.ok ? "삭제했어요." : result.error);
                    })
                  }
                  className="h-9 w-9 shrink-0 rounded-lg text-muted hover:bg-red-50 hover:text-red-600"
                >
                  <IconTrash size={16} className="mx-auto" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {node}
    </div>
  );
}
