"use client";

import Link from "next/link";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  useTransition,
} from "react";
import { saveInvitation } from "@/app/actions";
import { copyText } from "@/components/invitation/context";
import { InvitationView } from "@/components/invitation/InvitationView";
import { IconChevronLeft, IconExternal, IconEye, IconLink } from "@/components/icons";
import { useToast } from "@/components/site/Dialog";
import { formatKstTime, useOrigin } from "@/components/site/hooks";
import { PhoneFrame } from "@/components/site/Phone";
import { fullName } from "@/lib/invitation/defaults";
import { validateData } from "@/lib/invitation/normalize";
import type { InvitationData } from "@/lib/invitation/types";
import { BasicTab, type Updater } from "./BasicTab";
import { DesignTab } from "./DesignTab";
import { SectionsTab } from "./SectionsTab";
import { ShareTab } from "./ShareTab";

const TABS = [
  { id: "basic", label: "기본 정보" },
  { id: "design", label: "디자인" },
  { id: "sections", label: "섹션 구성" },
  { id: "share", label: "공유" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function Editor({
  id,
  initialData,
  initialUpdatedAt,
}: {
  id: string;
  initialData: InvitationData;
  initialUpdatedAt: string;
}) {
  const [data, setData] = useState(initialData);
  const [saved, setSaved] = useState(initialData);
  const [savedAt, setSavedAt] = useState(initialUpdatedAt);
  const [tab, setTab] = useState<TabId>("basic");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, startSaving] = useTransition();
  const { show: toast, node: toastNode } = useToast();
  // 입력은 즉시, 미리보기는 한 박자 늦게 그려서 타이핑이 버벅이지 않게 한다.
  const preview = useDeferredValue(data);
  const dirty = useMemo(() => JSON.stringify(data) !== JSON.stringify(saved), [data, saved]);
  const url = `${useOrigin()}/i/${id}`;

  const update: Updater = useCallback(
    (recipe) =>
      setData((prev) => {
        const next = structuredClone(prev);
        recipe(next);
        return next;
      }),
    [],
  );

  const save = () => {
    const problems = validateData(data);
    if (problems.length) {
      toast(problems[0]);
      setTab("basic");
      return;
    }
    const snapshot = data;
    startSaving(async () => {
      const result = await saveInvitation(id, snapshot);
      if (result.ok) {
        setSaved(snapshot);
        setSavedAt(result.updatedAt);
        toast("저장했어요. 이미 공유한 링크에도 바로 반영됐어요.");
      } else {
        toast(result.error);
      }
    });
  };

  // Ctrl/⌘ + S 로 저장
  const onShortcut = useEffectEvent((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (dirty && !saving) save();
    }
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onShortcut(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // 저장하지 않고 나가려 하면 경고
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!previewOpen) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [previewOpen]);

  const title = `${fullName(data.groom) || "신랑"} ♥ ${fullName(data.bride) || "신부"}`;
  const status = saving
    ? { text: "저장 중…", dot: "bg-muted animate-pulse" }
    : dirty
      ? { text: "저장 안 됨", dot: "bg-brand" }
      : { text: `${formatKstTime(savedAt)} 저장됨`, dot: "bg-free" };

  return (
    <div className="flex h-dvh flex-col bg-paper">
      <header className="flex h-14 shrink-0 items-center gap-1.5 border-b border-line bg-white px-2 sm:gap-2 sm:px-4">
        <Link
          href="/my"
          onClick={(e) => {
            // 앱 안에서 이동할 때는 beforeunload가 동작하지 않으므로 직접 확인한다.
            if (dirty && !window.confirm("저장하지 않은 변경사항이 있어요. 저장하지 않고 나갈까요?")) e.preventDefault();
          }}
          className="flex h-10 items-center gap-0.5 rounded-lg px-2 text-sm font-semibold text-ink-soft hover:bg-paper"
        >
          <IconChevronLeft size={18} />
          <span className="hidden sm:inline">내 청첩장</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold">{title}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-muted" aria-live="polite">
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            {status.text}
          </p>
        </div>
        <button
          type="button"
          onClick={async () => toast((await copyText(url)) ? "청첩장 링크를 복사했어요." : "복사하지 못했어요.")}
          className="hidden h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-ink-soft hover:bg-paper sm:flex"
        >
          <IconLink size={16} /> 링크 복사
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="hidden h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-ink-soft hover:bg-paper md:flex"
        >
          <IconExternal size={16} /> 청첩장 보기
        </a>
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-ink-soft hover:bg-paper lg:hidden"
        >
          <IconEye size={16} /> 미리보기
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="h-10 rounded-xl bg-brand px-4 text-sm font-bold text-white transition hover:bg-brand-deep disabled:bg-line disabled:text-muted"
        >
          저장
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col bg-paper lg:max-w-[560px] lg:border-r lg:border-line">
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-white px-2 sm:px-3" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative h-12 shrink-0 px-3.5 text-[15px] font-semibold transition",
                  tab === t.id ? "text-ink" : "text-muted hover:text-ink-soft",
                )}
              >
                {t.label}
                {tab === t.id && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-ink" />}
              </button>
            ))}
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto" role="tabpanel">
            <div className="mx-auto max-w-[560px] p-3 pb-28 sm:p-5">
              {tab === "basic" && <BasicTab data={data} update={update} />}
              {tab === "design" && <DesignTab data={data} update={update} />}
              {tab === "sections" && <SectionsTab data={data} update={update} />}
              {tab === "share" && <ShareTab data={data} update={update} url={url} dirty={dirty} toast={toast} />}
            </div>
          </div>
        </div>

        <div className="hidden min-h-0 flex-1 flex-col items-center gap-4 px-6 py-6 lg:flex">
          <div className="flex min-h-0 w-full flex-1 justify-center">
            <PhoneFrame className="phone--fit">
              <InvitationView data={preview} mode="preview" invitationId={id} />
            </PhoneFrame>
          </div>
          <p className="text-[13px] text-muted">
            실시간 미리보기 · <span className="font-semibold text-ink-soft">저장</span>하면 하객이 보는 링크에
            바로 반영돼요
          </p>
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-[60] bg-white [container-type:size] [transform:translateZ(0)] lg:hidden">
          <div className="h-full overflow-y-auto overscroll-contain">
            <InvitationView data={preview} mode="preview" invitationId={id} />
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen(false)}
            className="absolute left-3 top-3 z-[90] flex h-10 items-center gap-1 rounded-full bg-ink/85 pl-2 pr-4 text-sm font-semibold text-white shadow-lg backdrop-blur"
          >
            <IconChevronLeft size={18} /> 편집으로
          </button>
        </div>
      )}
      {toastNode}
    </div>
  );
}
