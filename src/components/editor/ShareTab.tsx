"use client";

import { useState } from "react";
import { copyText } from "@/components/invitation/context";
import { IconCopy, IconExternal, IconQr } from "@/components/icons";
import { QrDialog } from "@/components/site/QrCode";
import { shareMeta } from "@/lib/invitation/defaults";
import type { InvitationData } from "@/lib/invitation/types";
import type { Updater } from "./BasicTab";
import { Card, Field, Input, Textarea } from "./fields";
import { ImageField } from "./media";

export function ShareTab({
  data,
  update,
  url,
  dirty,
  toast,
}: {
  data: InvitationData;
  update: Updater;
  url: string;
  dirty: boolean;
  toast: (message: string) => void;
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const meta = shareMeta(data);
  const defaults = shareMeta({ ...data, share: { title: "", description: "", image: "" } });

  return (
    <div className="flex flex-col gap-4">
      <Card title="청첩장 링크" description="이 주소는 수정해도 바뀌지 않아요. 한 번 보내면 계속 같은 링크로 최신 내용이 보여요.">
        <div className="flex items-center gap-2 rounded-xl bg-paper px-3.5 py-3">
          <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{url}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={async () => toast((await copyText(url)) ? "링크를 복사했어요." : "복사하지 못했어요.")}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-ink text-sm font-semibold text-white"
          >
            <IconCopy size={16} /> 복사
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-line text-sm font-semibold"
          >
            <IconExternal size={16} /> 열기
          </a>
          <button
            type="button"
            onClick={() => setQrOpen(true)}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-line text-sm font-semibold"
          >
            <IconQr size={16} /> QR
          </button>
        </div>
        {dirty && (
          <p className="rounded-xl bg-brand-soft px-3.5 py-2.5 text-[13px] text-brand-deep">
            저장하지 않은 수정 사항이 있어요. 저장해야 링크에 반영돼요.
          </p>
        )}
        <QrDialog open={qrOpen} url={url} filename="wedding-invitation-qr" onClose={() => setQrOpen(false)} />
      </Card>

      <Card title="링크 미리보기" description="카카오톡·문자로 링크를 보낼 때 보이는 썸네일과 문구예요.">
        <Field label="썸네일 사진" group>
          <ImageField
            value={data.share.image}
            onChange={(url) => update((d) => void (d.share.image = url))}
            aspect="1 / 1"
            format="jpeg"
            maxSide={1200}
            hint="비워두면 메인 사진이 쓰여요."
          />
        </Field>
        <Field label="제목">
          <Input
            value={data.share.title}
            maxLength={60}
            placeholder={defaults.title}
            onChange={(e) => update((d) => void (d.share.title = e.target.value))}
          />
        </Field>
        <Field label="설명">
          <Textarea
            rows={2}
            maxLength={120}
            value={data.share.description}
            placeholder={defaults.description}
            onChange={(e) => update((d) => void (d.share.description = e.target.value))}
          />
        </Field>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-ink-soft">미리보기</p>
          <div className="w-64 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5">
            {meta.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={meta.image} alt="" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="aspect-[4/3] w-full bg-cream" />
            )}
            <div className="p-3.5">
              <p className="line-clamp-2 text-[14px] font-bold">{meta.title}</p>
              <p className="mt-1 line-clamp-2 whitespace-pre-line text-[12px] text-muted">{meta.description}</p>
            </div>
            <p className="border-t border-line py-2.5 text-center text-[13px] font-semibold">청첩장 보기</p>
          </div>
        </div>
        <p className="text-[12px] leading-relaxed text-muted">
          이미 보낸 메시지의 미리보기는 메신저가 저장해 두기 때문에 바로 바뀌지 않을 수 있어요. 링크를 열면
          항상 최신 내용이 보여요.
        </p>
      </Card>
    </div>
  );
}
