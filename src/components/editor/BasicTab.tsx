"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Dialog } from "@/components/site/Dialog";
import { KICKER_BY_THEME } from "@/lib/invitation/defaults";
import type { InvitationData, Parent, Person } from "@/lib/invitation/types";
import { embedAddressSearch } from "@/lib/script";
import { Card, Check, Field, Input, Row, Select } from "./fields";
import { ImageField } from "./media";

export type Updater = (recipe: (draft: InvitationData) => void) => void;

const RELATIONS = {
  groom: ["아들", "장남", "차남", "삼남", "막내", "외아들"],
  bride: ["딸", "장녀", "차녀", "삼녀", "막내", "외동딸"],
};

function ParentFields({
  label,
  parent,
  onChange,
}: {
  label: string;
  parent: Parent;
  onChange: (patch: Partial<Parent>) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-3">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="flex items-center justify-between text-[13px] font-semibold text-ink-soft">
          {label}
          <Check checked={parent.deceased} onChange={(deceased) => onChange({ deceased })}>
            <span className="text-[12px] font-normal">고인</span>
          </Check>
        </span>
        <Input
          value={parent.name}
          maxLength={20}
          placeholder="성함"
          aria-label={`${label} 성함`}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>
      <Field label="연락처">
        <Input
          type="tel"
          inputMode="tel"
          value={parent.phone}
          maxLength={20}
          placeholder="선택"
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      </Field>
    </div>
  );
}

function PersonFields({ side, person, update }: { side: "groom" | "bride"; person: Person; update: Updater }) {
  const set = (patch: Partial<Person>) => update((d) => Object.assign(d[side], patch));
  const setParent = (key: "father" | "mother") => (patch: Partial<Parent>) =>
    update((d) => Object.assign(d[side][key], patch));
  const listId = `relations-${side}`;

  return (
    <>
      <Row>
        <Field label="성">
          <Input value={person.lastName} maxLength={10} onChange={(e) => set({ lastName: e.target.value })} />
        </Field>
        <Field label="이름">
          <Input value={person.firstName} maxLength={20} onChange={(e) => set({ firstName: e.target.value })} />
        </Field>
      </Row>
      <Row>
        <Field label="관계" hint="예: 장남, 차녀">
          <Input list={listId} value={person.relation} maxLength={10} onChange={(e) => set({ relation: e.target.value })} />
          <datalist id={listId}>
            {RELATIONS[side].map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </Field>
        <Field label="연락처" hint="비워두면 표시되지 않아요">
          <Input
            type="tel"
            inputMode="tel"
            value={person.phone}
            maxLength={20}
            placeholder="010-0000-0000"
            onChange={(e) => set({ phone: e.target.value })}
          />
        </Field>
      </Row>
      <ParentFields label="아버지" parent={person.father} onChange={setParent("father")} />
      <ParentFields label="어머니" parent={person.mother} onChange={setParent("mother")} />
    </>
  );
}

function AddressDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (address: string, building: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const select = useEffectEvent((address: string, building: string) => {
    onSelect(address, building);
    onClose();
  });

  useEffect(() => {
    if (!open || !ref.current) return;
    embedAddressSearch(ref.current, select).catch(() => setFailed(true));
  }, [open]);

  return (
    <Dialog open={open} title="주소 검색" onClose={onClose}>
      {failed ? (
        <p className="py-10 text-center text-sm text-muted">주소 검색을 불러오지 못했어요. 직접 입력해 주세요.</p>
      ) : (
        <div ref={ref} className="h-[440px] overflow-hidden rounded-xl border border-line" />
      )}
    </Dialog>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

export function BasicTab({ data, update }: { data: InvitationData; update: Updater }) {
  const [searching, setSearching] = useState(false);
  const [hour, minute] = data.wedding.time.split(":").map(Number);
  const setTime = (h: number, m: number) => update((d) => void (d.wedding.time = `${pad(h)}:${pad(m)}`));
  const kickers = [...new Set(Object.values(KICKER_BY_THEME))];

  return (
    <div className="flex flex-col gap-4">
      <Card title="신랑">
        <PersonFields side="groom" person={data.groom} update={update} />
      </Card>
      <Card title="신부">
        <PersonFields side="bride" person={data.bride} update={update} />
      </Card>

      <Card title="예식 일시" description="하객이 어느 나라에 있든 같은 날짜·시간으로 보여요.">
        <Field label="날짜">
          <Input type="date" value={data.wedding.date} onChange={(e) => update((d) => void (d.wedding.date = e.target.value))} />
        </Field>
        <Row>
          <Field label="시">
            <Select value={hour} onChange={(e) => setTime(Number(e.target.value), minute)}>
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h < 12 ? "오전" : "오후"} {h % 12 || 12}시
                </option>
              ))}
            </Select>
          </Field>
          <Field label="분">
            <Select value={minute} onChange={(e) => setTime(hour, Number(e.target.value))}>
              {[...new Set([...MINUTES, minute])].sort((a, b) => a - b).map((m) => (
                <option key={m} value={m}>
                  {pad(m)}분
                </option>
              ))}
            </Select>
          </Field>
        </Row>
      </Card>

      <Card
        title="예식장"
        description="끄면 장소·지도·교통편이 청첩장에 표시되지 않아요."
        enabled={data.venue.enabled}
        onToggle={(on) => update((d) => void (d.venue.enabled = on))}
      >
        <Row>
          <Field label="예식장 이름">
            <Input value={data.venue.name} maxLength={40} onChange={(e) => update((d) => void (d.venue.name = e.target.value))} />
          </Field>
          <Field label="층 · 홀">
            <Input value={data.venue.hall} maxLength={40} placeholder="예: 5층 그랜드볼룸" onChange={(e) => update((d) => void (d.venue.hall = e.target.value))} />
          </Field>
        </Row>
        <div className="flex items-end gap-2">
          <Field label="주소" className="flex-1">
            <Input value={data.venue.address} maxLength={120} onChange={(e) => update((d) => void (d.venue.address = e.target.value))} />
          </Field>
          <button
            type="button"
            onClick={() => setSearching(true)}
            className="h-11 shrink-0 rounded-xl bg-ink px-4 text-sm font-semibold text-white"
          >
            주소 검색
          </button>
        </div>
        <Field label="예식장 전화번호" hint="선택 입력">
          <Input type="tel" value={data.venue.tel} maxLength={20} onChange={(e) => update((d) => void (d.venue.tel = e.target.value))} />
        </Field>
        <AddressDialog
          open={searching}
          onClose={() => setSearching(false)}
          onSelect={(address, building) =>
            update((d) => {
              d.venue.address = address;
              if (!d.venue.name.trim() && building) d.venue.name = building;
            })
          }
        />
      </Card>

      <Card title="메인 화면" description="청첩장을 열었을 때 처음 보이는 사진과 문구예요.">
        <Field label="메인 사진" group>
          <ImageField
            value={data.main.photo}
            onChange={(url) => update((d) => void (d.main.photo = url))}
            format="jpeg"
            hint="세로 사진을 추천해요. 공유 썸네일을 따로 정하지 않으면 이 사진이 쓰여요."
          />
        </Field>
        <div className="flex flex-col gap-2">
          <Field label="상단 문구">
            <Input value={data.main.kicker} maxLength={40} onChange={(e) => update((d) => void (d.main.kicker = e.target.value))} />
          </Field>
          <div className="flex flex-wrap gap-1.5">
            {kickers.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => update((d) => void (d.main.kicker = k))}
                className="rounded-full bg-paper px-2.5 py-1 text-[12px] text-ink-soft hover:bg-cream"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
