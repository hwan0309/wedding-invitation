"use client";

import { useEffect, useState, type FormEvent } from "react";
import { IconClose } from "@/components/icons";
import { LIMITS } from "@/lib/config";
import type { GuestbookItem } from "@/lib/invitation/guest";
import { useInvitation } from "../context";
import { Modal, Reveal, SectionTitle } from "../ui";

const SAMPLE_ENTRIES: GuestbookItem[] = [
  {
    id: "sample-1",
    name: "민지",
    message: "두 사람의 새로운 시작을 진심으로 축하해! 지금처럼 늘 행복하길 바랄게 💐",
    createdAt: "2026-10-01T03:00:00.000Z",
  },
  {
    id: "sample-2",
    name: "현우",
    message: "결혼 축하합니다! 예쁘게 잘 살아요 :)",
    createdAt: "2026-09-28T10:00:00.000Z",
  },
];

const PREVIEW_COUNT = 5;

function formatEntryDate(iso: string) {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "";
  const kst = new Date(time + 9 * 3_600_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${kst.getUTCFullYear()}.${pad(kst.getUTCMonth() + 1)}.${pad(kst.getUTCDate())}`;
}

function EntryCard({ entry, onDelete }: { entry: GuestbookItem; onDelete: () => void }) {
  return (
    <article className="inv-gb-entry">
      <header>
        <strong>{entry.name}</strong>
        <span>{formatEntryDate(entry.createdAt)}</span>
        <button type="button" aria-label="삭제" onClick={onDelete}>
          <IconClose size={14} />
        </button>
      </header>
      <p>{entry.message}</p>
    </article>
  );
}

async function request(url: string, init: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? "잠시 후 다시 시도해 주세요.");
  return body;
}

export function Guestbook() {
  const { mode, invitationId, toast } = useInvitation();
  const live = mode === "live" && invitationId;
  const api = `/api/invitations/${invitationId}/guestbook`;

  const [entries, setEntries] = useState<GuestbookItem[] | null>(live ? null : SAMPLE_ENTRIES);
  const [writing, setWriting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [deleting, setDeleting] = useState<GuestbookItem | null>(null);
  const [form, setForm] = useState({ name: "", password: "", message: "" });
  const [deletePassword, setDeletePassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!live) return;
    fetch(api)
      .then((res) => (res.ok ? res.json() : { entries: [] }))
      .then((body: { entries: GuestbookItem[] }) => setEntries(body.entries))
      .catch(() => setEntries([]));
  }, [api, live]);

  const blockedInPreview = () => {
    if (live) return false;
    toast(mode === "sample" ? "샘플 청첩장에서는 작성할 수 없어요." : "미리보기에서는 실제로 저장되지 않아요.");
    return true;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (blockedInPreview()) return;
    setBusy(true);
    setError("");
    try {
      const { entry } = await request(api, { method: "POST", body: JSON.stringify(form) });
      setEntries((prev) => [entry, ...(prev ?? [])]);
      setForm({ name: "", password: "", message: "" });
      setWriting(false);
      toast("방명록을 남겼어요. 감사합니다!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (e: FormEvent) => {
    e.preventDefault();
    if (!deleting || blockedInPreview()) return;
    setBusy(true);
    setError("");
    try {
      await request(`${api}/${deleting.id}`, {
        method: "DELETE",
        body: JSON.stringify({ password: deletePassword }),
      });
      setEntries((prev) => (prev ?? []).filter((x) => x.id !== deleting.id));
      setDeleting(null);
      setDeletePassword("");
      toast("삭제했어요.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const openDelete = (entry: GuestbookItem) => {
    setError("");
    setDeleting(entry);
  };

  const list = entries ?? [];

  return (
    <section className="inv-section inv-guestbook">
      <Reveal>
        <SectionTitle en="Guest Book" ko="방명록" />
        <p className="inv-text inv-text--sub">
          축하의 마음을 담아 따뜻한 한마디를 남겨주세요.
        </p>
      </Reveal>
      <Reveal className="inv-gb-list">
        {entries === null && <p className="inv-gb-empty">불러오는 중…</p>}
        {entries !== null && list.length === 0 && (
          <p className="inv-gb-empty">
            아직 작성된 방명록이 없어요.
            <br />첫 번째 축하 메시지를 남겨주세요!
          </p>
        )}
        {list.slice(0, PREVIEW_COUNT).map((entry) => (
          <EntryCard key={entry.id} entry={entry} onDelete={() => openDelete(entry)} />
        ))}
      </Reveal>
      <div className="inv-btn-row">
        {list.length > PREVIEW_COUNT && (
          <button type="button" className="inv-btn inv-btn--line" onClick={() => setShowAll(true)}>
            전체 보기 ({list.length})
          </button>
        )}
        <button
          type="button"
          className="inv-btn"
          onClick={() => {
            setError("");
            setWriting(true);
          }}
        >
          방명록 작성하기
        </button>
      </div>

      <Modal open={writing} title="방명록 작성" onClose={() => setWriting(false)}>
        <form className="inv-form" onSubmit={submit}>
          <div className="inv-form__row">
            <label>
              이름
              <input
                value={form.name}
                maxLength={LIMITS.guestbookNameMax}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              비밀번호
              <input
                type="password"
                value={form.password}
                minLength={4}
                maxLength={20}
                placeholder="삭제할 때 필요해요"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
          </div>
          <label>
            축하 메시지
            <textarea
              rows={4}
              value={form.message}
              maxLength={LIMITS.guestbookMessageMax}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <span className="inv-form__count">
              {form.message.length} / {LIMITS.guestbookMessageMax}
            </span>
          </label>
          {error && <p className="inv-form__error">{error}</p>}
          <button type="submit" className="inv-btn inv-btn--block" disabled={busy}>
            {busy ? "등록 중…" : "등록하기"}
          </button>
        </form>
      </Modal>

      <Modal open={deleting !== null} title="방명록 삭제" onClose={() => setDeleting(null)}>
        <form className="inv-form" onSubmit={remove}>
          <p className="inv-form__desc">작성할 때 입력한 비밀번호를 입력해 주세요.</p>
          <label>
            비밀번호
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="inv-form__error">{error}</p>}
          <button type="submit" className="inv-btn inv-btn--block" disabled={busy}>
            {busy ? "삭제 중…" : "삭제하기"}
          </button>
        </form>
      </Modal>

      <Modal open={showAll} title={`방명록 (${list.length})`} onClose={() => setShowAll(false)}>
        <div className="inv-gb-list">
          {list.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onDelete={() => {
                setShowAll(false);
                openDelete(entry);
              }}
            />
          ))}
        </div>
      </Modal>
    </section>
  );
}
