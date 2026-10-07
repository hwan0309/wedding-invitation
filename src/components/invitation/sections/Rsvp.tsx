"use client";

import { useState, type FormEvent } from "react";
import { IconCheck } from "@/components/icons";
import type { RsvpInput } from "@/lib/invitation/guest";
import { useInvitation, useStoredFlag } from "../context";
import { Modal, Reveal, SectionTitle, cx } from "../ui";

const initialForm: RsvpInput = {
  side: "groom",
  attending: true,
  name: "",
  companions: 0,
  meal: "yes",
  phone: "",
  message: "",
};

function Segmented<T extends string | boolean>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inv-segment" role="radiogroup">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={cx(o.value === value && "is-active")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Rsvp() {
  const { data, mode, invitationId, toast } = useInvitation();
  const live = mode === "live" && invitationId;
  const storageKey = `rsvp-sent:${invitationId}`;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RsvpInput>(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentNow, setSent] = useState(false);
  const stored = useStoredFlag(storageKey);
  const sent = sentNow || Boolean(live && stored);

  const update = (patch: Partial<RsvpInput>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!live) {
      toast(mode === "sample" ? "샘플 청첩장에서는 전달되지 않아요." : "미리보기에서는 실제로 전달되지 않아요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/invitations/${invitationId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "잠시 후 다시 시도해 주세요.");
      try {
        localStorage.setItem(storageKey, "1");
      } catch {}
      setSent(true);
      setOpen(false);
      setForm(initialForm);
      toast("참석 의사를 전달했어요. 감사합니다!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="inv-section inv-section--surface inv-rsvp">
      <Reveal>
        <SectionTitle en="R.S.V.P." ko="참석 의사 전달" />
        {data.rsvp.message && <p className="inv-text inv-text--sub">{data.rsvp.message}</p>}
        {sent && (
          <p className="inv-rsvp__sent">
            <IconCheck size={16} /> 참석 의사를 전달하셨어요
          </p>
        )}
        <button
          type="button"
          className={cx("inv-btn", sent && "inv-btn--line")}
          onClick={() => {
            setError("");
            setOpen(true);
          }}
        >
          {sent ? "다시 전달하기" : "참석 의사 전달하기"}
        </button>
      </Reveal>

      <Modal open={open} title="참석 의사 전달" onClose={() => setOpen(false)}>
        <form className="inv-form" onSubmit={submit}>
          <div className="inv-form__field">
            <span>어느 측 하객이신가요?</span>
            <Segmented
              value={form.side}
              options={[
                { value: "groom", label: "신랑측" },
                { value: "bride", label: "신부측" },
              ]}
              onChange={(side) => update({ side })}
            />
          </div>
          <div className="inv-form__field">
            <span>참석 여부</span>
            <Segmented
              value={form.attending}
              options={[
                { value: true, label: "참석할게요" },
                { value: false, label: "참석이 어려워요" },
              ]}
              onChange={(attending) => update({ attending })}
            />
          </div>
          <label>
            성함
            <input
              value={form.name}
              maxLength={20}
              onChange={(e) => update({ name: e.target.value })}
              required
            />
          </label>
          {form.attending && (
            <>
              <div className="inv-form__field">
                <span>본인 외 동행 인원</span>
                <div className="inv-stepper">
                  <button
                    type="button"
                    aria-label="줄이기"
                    onClick={() => update({ companions: Math.max(0, form.companions - 1) })}
                  >
                    −
                  </button>
                  <output>{form.companions}명</output>
                  <button
                    type="button"
                    aria-label="늘리기"
                    onClick={() => update({ companions: Math.min(10, form.companions + 1) })}
                  >
                    +
                  </button>
                </div>
              </div>
              {data.rsvp.askMeal && (
                <div className="inv-form__field">
                  <span>식사 여부</span>
                  <Segmented
                    value={form.meal}
                    options={[
                      { value: "yes", label: "예정" },
                      { value: "no", label: "안 함" },
                      { value: "undecided", label: "미정" },
                    ]}
                    onChange={(meal) => update({ meal })}
                  />
                </div>
              )}
            </>
          )}
          <label>
            <span>
              연락처 <small>(선택)</small>
            </span>
            <input
              type="tel"
              value={form.phone}
              maxLength={20}
              onChange={(e) => update({ phone: e.target.value })}
            />
          </label>
          <label>
            <span>
              전하실 말씀 <small>(선택)</small>
            </span>
            <textarea
              rows={2}
              value={form.message}
              maxLength={200}
              onChange={(e) => update({ message: e.target.value })}
            />
          </label>
          {error && <p className="inv-form__error">{error}</p>}
          <button type="submit" className="inv-btn inv-btn--block" disabled={busy}>
            {busy ? "전달 중…" : "전달하기"}
          </button>
        </form>
      </Modal>
    </section>
  );
}
