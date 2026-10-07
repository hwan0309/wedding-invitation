"use client";

import type { AccountItem, InvitationData, TransportType } from "@/lib/invitation/types";
import type { Updater } from "./BasicTab";
import { Card, Field, Input, ListEditor, Row, Segmented, Select, Switch, Textarea, newId } from "./fields";
import { AudioField, GalleryField, ImageField } from "./media";

const GREETING_TEMPLATES = [
  "서로 다른 길을 걸어온 두 사람이\n이제 같은 길을 함께 걸어가려 합니다.\n\n늘 곁에서 아껴주신 고마운 분들을 모시고\n사랑의 약속을 하려 하오니\n귀한 걸음으로 축복해 주시면\n더없는 기쁨으로 간직하겠습니다.",
  "봄날의 햇살처럼 따뜻한 사람을 만나\n평생을 함께하기로 약속했습니다.\n\n저희 두 사람의 첫걸음에\n함께해 주시면 감사하겠습니다.",
  "오랜 기다림 속에서 저희 두 사람\n한마음 되어 참된 사랑의 결실을 맺게 되었습니다.\n\n오셔서 축복해 주시면\n큰 기쁨이겠습니다.",
];

const TRANSPORT_TYPES: { value: TransportType; label: string }[] = [
  { value: "subway", label: "지하철" },
  { value: "bus", label: "버스" },
  { value: "car", label: "자가용" },
  { value: "parking", label: "주차" },
  { value: "train", label: "기차" },
  { value: "shuttle", label: "셔틀·전세버스" },
  { value: "etc", label: "기타" },
];

function SwitchRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>
        <span className="block text-sm font-semibold text-ink-soft">{label}</span>
        {desc && <span className="block text-[12px] text-muted">{desc}</span>}
      </span>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function AccountList({ side, data, update }: { side: "groom" | "bride"; data: InvitationData; update: Updater }) {
  const group = data.account[side];
  const defaultRole = side === "groom" ? "신랑" : "신부";
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line p-4">
      <SwitchRow
        label={side === "groom" ? "신랑측 계좌" : "신부측 계좌"}
        checked={group.enabled}
        onChange={(on) => update((d) => void (d.account[side].enabled = on))}
      />
      {group.enabled && (
        <>
          <Field label="버튼 문구">
            <Input value={group.title} maxLength={30} onChange={(e) => update((d) => void (d.account[side].title = e.target.value))} />
          </Field>
          <ListEditor<AccountItem>
            items={group.items}
            max={6}
            addLabel="계좌 추가"
            itemTitle={(item, i) => item.role || `계좌 ${i + 1}`}
            create={() => ({ id: newId(), role: group.items.length ? "" : defaultRole, holder: "", bank: "", number: "", kakaopay: "" })}
            onChange={(items) => update((d) => void (d.account[side].items = items))}
            renderItem={(item, patch) => (
              <>
                <Row>
                  <Field label="구분">
                    <Input value={item.role} maxLength={20} placeholder={`${defaultRole}, 아버지…`} onChange={(e) => patch({ role: e.target.value })} />
                  </Field>
                  <Field label="예금주">
                    <Input value={item.holder} maxLength={20} onChange={(e) => patch({ holder: e.target.value })} />
                  </Field>
                </Row>
                <Row>
                  <Field label="은행">
                    <Input value={item.bank} maxLength={20} onChange={(e) => patch({ bank: e.target.value })} />
                  </Field>
                  <Field label="계좌번호">
                    <Input value={item.number} maxLength={40} inputMode="numeric" onChange={(e) => patch({ number: e.target.value })} />
                  </Field>
                </Row>
                <Field label="카카오페이 송금 링크" hint="카카오페이 앱 > 송금 > 송금코드에서 복사한 https://qr.kakaopay.com/… 주소 (선택)">
                  <Input value={item.kakaopay} maxLength={200} placeholder="https://qr.kakaopay.com/…" onChange={(e) => patch({ kakaopay: e.target.value.trim() })} />
                </Field>
              </>
            )}
          />
        </>
      )}
    </div>
  );
}

export function SectionsTab({ data, update }: { data: InvitationData; update: Updater }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="px-1 text-[13px] text-muted">필요 없는 섹션은 꺼 두세요. 켜고 끄는 건 언제든 바꿀 수 있어요.</p>

      <Card
        title="모시는 말씀"
        collapsible
        defaultOpen={false}
        enabled={data.greeting.enabled}
        onToggle={(on) => update((d) => void (d.greeting.enabled = on))}
      >
        <Field label="제목">
          <Input value={data.greeting.title} maxLength={40} onChange={(e) => update((d) => void (d.greeting.title = e.target.value))} />
        </Field>
        <Field label="내용">
          <Textarea rows={8} maxLength={1000} value={data.greeting.content} onChange={(e) => update((d) => void (d.greeting.content = e.target.value))} />
        </Field>
        <div className="flex flex-wrap gap-1.5">
          {GREETING_TEMPLATES.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => update((d) => void (d.greeting.content = t))}
              className="rounded-full bg-paper px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:bg-cream"
            >
              예시 문구 {i + 1}
            </button>
          ))}
        </div>
        <SwitchRow
          label="혼주 성함 표시"
          desc="예: 이성민 · 김미경 의 장남 준호"
          checked={data.greeting.showParents}
          onChange={(on) => update((d) => void (d.greeting.showParents = on))}
        />
        <Field label="고인 표시 방식" group>
          <Segmented
            value={data.greeting.deceasedMark}
            onChange={(v) => update((d) => void (d.greeting.deceasedMark = v))}
            options={[
              { value: "hanja", label: "故 (한자)" },
              { value: "flower", label: "국화 아이콘" },
            ]}
          />
        </Field>
      </Card>

      <Card
        title="예식일 달력"
        collapsible
        defaultOpen={false}
        enabled={data.calendar.enabled}
        onToggle={(on) => update((d) => void (d.calendar.enabled = on))}
      >
        <SwitchRow
          label="D-day 카운트다운"
          checked={data.calendar.countdown}
          onChange={(on) => update((d) => void (d.calendar.countdown = on))}
        />
      </Card>

      <Card
        title="갤러리"
        collapsible
        defaultOpen={false}
        enabled={data.gallery.enabled}
        onToggle={(on) => update((d) => void (d.gallery.enabled = on))}
      >
        <GalleryField
          images={data.gallery.images}
          onAppend={(url) => update((d) => void d.gallery.images.push(url))}
          onChange={(images) => update((d) => void (d.gallery.images = images))}
        />
        <Field label="배치" group>
          <Segmented
            value={data.gallery.layout}
            onChange={(v) => update((d) => void (d.gallery.layout = v))}
            options={[
              { value: "slide", label: "슬라이드" },
              { value: "grid", label: "바둑판" },
            ]}
          />
        </Field>
        <SwitchRow
          label="사진 확대·저장 방지"
          desc="크게 보기 화면에서 손가락 확대와 길게 눌러 저장하기를 막아요."
          checked={data.gallery.preventZoom}
          onChange={(on) => update((d) => void (d.gallery.preventZoom = on))}
        />
      </Card>

      <Card
        title="오시는 길 · 교통편"
        description={data.venue.enabled ? "예식장 이름·주소는 기본 정보 탭에서 입력해요." : "기본 정보 탭에서 예식장 표시가 꺼져 있어요."}
        collapsible
        defaultOpen={false}
      >
        <SwitchRow
          label="길찾기 버튼"
          desc="카카오맵 · 네이버 지도 · 티맵"
          checked={data.location.showNavButtons}
          onChange={(on) => update((d) => void (d.location.showNavButtons = on))}
        />
        <ListEditor
          items={data.location.transports}
          max={10}
          addLabel="교통편 추가"
          itemTitle={(item) => item.title || "교통편"}
          create={() => ({ id: newId(), type: "subway" as TransportType, title: "지하철", content: "" })}
          onChange={(items) => update((d) => void (d.location.transports = items))}
          renderItem={(item, patch) => (
            <>
              <Row>
                <Field label="종류">
                  <Select
                    value={item.type}
                    onChange={(e) => {
                      const type = e.target.value as TransportType;
                      const label = TRANSPORT_TYPES.find((t) => t.value === type)?.label ?? "";
                      const wasDefault = TRANSPORT_TYPES.some((t) => t.label === item.title);
                      patch({ type, ...(wasDefault || !item.title ? { title: label } : {}) });
                    }}
                  >
                    {TRANSPORT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="제목">
                  <Input value={item.title} maxLength={20} onChange={(e) => patch({ title: e.target.value })} />
                </Field>
              </Row>
              <Field label="안내">
                <Textarea rows={3} maxLength={500} value={item.content} onChange={(e) => patch({ content: e.target.value })} />
              </Field>
            </>
          )}
        />
      </Card>

      <Card
        title="안내사항"
        description="식사·주차·셔틀버스 등"
        collapsible
        defaultOpen={false}
        enabled={data.notice.enabled}
        onToggle={(on) => update((d) => void (d.notice.enabled = on))}
      >
        <Field label="섹션 제목">
          <Input value={data.notice.title} maxLength={30} onChange={(e) => update((d) => void (d.notice.title = e.target.value))} />
        </Field>
        <ListEditor
          items={data.notice.items}
          max={6}
          addLabel="안내 추가"
          itemTitle={(item, i) => item.title || `안내 ${i + 1}`}
          create={() => ({ id: newId(), title: "", content: "" })}
          onChange={(items) => update((d) => void (d.notice.items = items))}
          renderItem={(item, patch) => (
            <>
              <Field label="제목">
                <Input value={item.title} maxLength={20} onChange={(e) => patch({ title: e.target.value })} />
              </Field>
              <Field label="내용">
                <Textarea rows={3} maxLength={600} value={item.content} onChange={(e) => patch({ content: e.target.value })} />
              </Field>
            </>
          )}
        />
      </Card>

      <Card
        title="마음 전하실 곳"
        description="계좌번호 복사 · 카카오페이 송금"
        collapsible
        defaultOpen={false}
        enabled={data.account.enabled}
        onToggle={(on) => update((d) => void (d.account.enabled = on))}
      >
        <Field label="섹션 제목">
          <Input value={data.account.title} maxLength={30} onChange={(e) => update((d) => void (d.account.title = e.target.value))} />
        </Field>
        <Field label="안내 문구">
          <Textarea rows={3} maxLength={300} value={data.account.message} onChange={(e) => update((d) => void (d.account.message = e.target.value))} />
        </Field>
        <AccountList side="groom" data={data} update={update} />
        <AccountList side="bride" data={data} update={update} />
      </Card>

      <Card
        title="방명록"
        description="하객이 비밀번호를 정해 축하 글을 남겨요. 글 관리는 ‘내 청첩장 > 응답 관리’에서."
        collapsible
        defaultOpen={false}
        enabled={data.guestbook.enabled}
        onToggle={(on) => update((d) => void (d.guestbook.enabled = on))}
      />

      <Card
        title="참석 의사 (RSVP)"
        description="응답은 ‘내 청첩장 > 응답 관리’에서 모아 볼 수 있어요."
        collapsible
        defaultOpen={false}
        enabled={data.rsvp.enabled}
        onToggle={(on) => update((d) => void (d.rsvp.enabled = on))}
      >
        <Field label="안내 문구">
          <Textarea rows={3} maxLength={300} value={data.rsvp.message} onChange={(e) => update((d) => void (d.rsvp.message = e.target.value))} />
        </Field>
        <SwitchRow label="식사 여부 묻기" checked={data.rsvp.askMeal} onChange={(on) => update((d) => void (d.rsvp.askMeal = on))} />
      </Card>

      <Card
        title="배경음악"
        collapsible
        defaultOpen={false}
        enabled={data.bgm.enabled}
        onToggle={(on) => update((d) => void (d.bgm.enabled = on))}
      >
        <AudioField value={data.bgm.src} onChange={(url) => update((d) => void (d.bgm.src = url))} />
        <SwitchRow
          label="자동 재생"
          desc="브라우저 정책상 하객이 화면을 처음 터치할 때 재생이 시작될 수 있어요."
          checked={data.bgm.autoplay}
          onChange={(on) => update((d) => void (d.bgm.autoplay = on))}
        />
        <p className="text-[12px] text-muted">저작권 문제가 없는 음원만 올려 주세요.</p>
      </Card>

      <Card
        title="마무리 인사"
        collapsible
        defaultOpen={false}
        enabled={data.ending.enabled}
        onToggle={(on) => update((d) => void (d.ending.enabled = on))}
      >
        <Field label="사진" group>
          <ImageField value={data.ending.photo} aspect="4 / 3" onChange={(url) => update((d) => void (d.ending.photo = url))} />
        </Field>
        <Field label="문구">
          <Textarea rows={3} maxLength={300} value={data.ending.message} onChange={(e) => update((d) => void (d.ending.message = e.target.value))} />
        </Field>
      </Card>
    </div>
  );
}
