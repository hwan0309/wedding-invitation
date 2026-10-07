"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteInvitation, duplicateInvitation } from "@/app/actions";
import { copyText, useNow } from "@/components/invitation/context";
import {
  IconCopy,
  IconDuplicate,
  IconEdit,
  IconExternal,
  IconPlus,
  IconQr,
  IconTrash,
  IconUsers,
} from "@/components/icons";
import { Dialog, useToast } from "@/components/site/Dialog";
import { formatKstDate, useOrigin } from "@/components/site/hooks";
import { CoverThumb } from "@/components/site/Phone";
import { QrDialog } from "@/components/site/QrCode";
import { daysUntil, formatDateKo, formatTimeKo } from "@/lib/invitation/date";
import { fullName } from "@/lib/invitation/defaults";
import type { InvitationData } from "@/lib/invitation/types";

export interface InvitationSummary {
  id: string;
  data: InvitationData;
  updatedAt: string;
  rsvpCount: number;
  guestbookCount: number;
}

function DdayBadge({ date }: { date: string }) {
  const now = useNow();
  const days = now === null ? null : daysUntil(date, now);
  if (days === null) return null;
  const label = days > 0 ? `D-${days}` : days === 0 ? "D-DAY" : `D+${-days}`;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${days >= 0 ? "bg-brand-soft text-brand" : "bg-paper text-muted"}`}>
      {label}
    </span>
  );
}

const actionBase =
  "flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold transition disabled:opacity-50";
const actionClass = `${actionBase} border-line bg-white text-ink-soft hover:border-ink/25 hover:text-ink`;
const primaryActionClass = `${actionBase} border-ink bg-ink text-white hover:bg-black`;

function InvitationCard({
  item,
  canDuplicate,
  onToast,
}: {
  item: InvitationSummary;
  canDuplicate: boolean;
  onToast: (message: string) => void;
}) {
  const origin = useOrigin();
  const url = `${origin}/i/${item.id}`;
  const [qrOpen, setQrOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const { data } = item;
  const title = `${fullName(data.groom) || "신랑"} ♥ ${fullName(data.bride) || "신부"}`;

  const run = (action: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      const result = await action();
      onToast(result.ok ? success : (result.error ?? "잠시 후 다시 시도해 주세요."));
    });

  return (
    <article className="rounded-3xl border border-line bg-white p-4 sm:p-5">
      <div className="flex gap-4 sm:gap-5">
        <Link href={`/edit/${item.id}`} className="block w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-line sm:w-32">
          <CoverThumb data={data} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="truncate text-lg font-bold">{title}</h2>
            <DdayBadge date={data.wedding.date} />
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            {formatDateKo(data.wedding.date)} {formatTimeKo(data.wedding.time)}
          </p>
          {data.venue.enabled && data.venue.name && (
            <p className="text-sm text-muted">
              {data.venue.name} {data.venue.hall}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted">
            <span>참석 응답 {item.rsvpCount}건</span>
            <span>방명록 {item.guestbookCount}개</span>
            <span>수정 {formatKstDate(item.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-paper px-3 py-2">
          <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink-soft">{url}</span>
          <button
            type="button"
            onClick={async () => onToast((await copyText(url)) ? "링크를 복사했어요." : "복사하지 못했어요.")}
            className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-brand"
          >
            <IconCopy size={14} /> 복사
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Link href={`/edit/${item.id}`} className={primaryActionClass}>
            <IconEdit size={16} /> 수정하기
          </Link>
          <a href={url} target="_blank" rel="noreferrer" className={actionClass}>
            <IconExternal size={16} /> 청첩장 보기
          </a>
          <Link href={`/my/${item.id}`} className={actionClass}>
            <IconUsers size={16} /> 응답 관리
          </Link>
          <button type="button" className={actionClass} onClick={() => setQrOpen(true)}>
            <IconQr size={16} /> QR 코드
          </button>
          <button
            type="button"
            className={actionClass}
            disabled={pending || !canDuplicate}
            title={canDuplicate ? undefined : "최대 개수에 도달했어요"}
            onClick={() => run(() => duplicateInvitation(item.id), "복제했어요. 새 링크가 만들어졌어요.")}
          >
            <IconDuplicate size={16} /> 복제
          </button>
          <button type="button" className={`${actionClass} hover:border-red-200 hover:text-red-600`} disabled={pending} onClick={() => setConfirming(true)}>
            <IconTrash size={16} /> 삭제
          </button>
        </div>
      </div>

      <QrDialog open={qrOpen} url={url} filename={`invitation-${item.id}-qr`} onClose={() => setQrOpen(false)} />
      <Dialog open={confirming} title="청첩장을 삭제할까요?" onClose={() => setConfirming(false)}>
        <p className="leading-relaxed text-ink-soft">
          <strong className="text-ink">{title}</strong> 청첩장을 삭제하면 이 링크로 더 이상 접속할 수 없고, 사진·방명록·참석
          응답도 함께 지워져요. 되돌릴 수 없어요.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" className="h-12 rounded-xl border border-line font-semibold" onClick={() => setConfirming(false)}>
            취소
          </button>
          <button
            type="button"
            className="h-12 rounded-xl bg-red-600 font-semibold text-white disabled:opacity-60"
            disabled={pending}
            onClick={() => {
              setConfirming(false);
              run(() => deleteInvitation(item.id), "삭제했어요.");
            }}
          >
            삭제하기
          </button>
        </div>
      </Dialog>
    </article>
  );
}

export function InvitationList({ items, limit }: { items: InvitationSummary[]; limit: number }) {
  const { show, node } = useToast();
  const canCreate = items.length < limit;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">
            {items.length} / {limit}개
          </span>{" "}
          사용 중
        </p>
        {canCreate && (
          <Link href="/create" className="flex h-10 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-bold text-white hover:bg-brand-deep">
            <IconPlus size={16} /> 새 청첩장
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
          <p className="text-lg font-bold">아직 만든 청첩장이 없어요</p>
          <p className="mt-2 text-ink-soft">테마를 고르면 예시 내용이 채워진 청첩장이 바로 만들어져요.</p>
          <Link href="/create" className="mt-6 inline-flex h-12 items-center rounded-xl bg-brand px-6 font-bold text-white">
            청첩장 만들기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <InvitationCard key={item.id} item={item} canDuplicate={canCreate} onToast={show} />
          ))}
        </div>
      )}
      {node}
    </>
  );
}
