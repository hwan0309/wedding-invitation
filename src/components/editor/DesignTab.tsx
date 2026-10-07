"use client";

import { useMemo } from "react";
import { IconCheck } from "@/components/icons";
import { CoverThumb } from "@/components/site/Phone";
import { KICKER_BY_THEME } from "@/lib/invitation/defaults";
import { FONTS, PALETTES, THEMES, getTheme } from "@/lib/invitation/themes";
import type { FontScale, InvitationData, ThemeId } from "@/lib/invitation/types";
import type { Updater } from "./BasicTab";
import { Card, Segmented } from "./fields";

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function DesignTab({ data, update }: { data: InvitationData; update: Updater }) {
  const current = data.design;
  const theme = getTheme(current.theme);
  const recommended = current.palette === theme.palette && current.font === theme.font;

  // 테마 카드에는 지금 입력한 사진·이름이 그대로 들어간 커버를 보여준다.
  const previews = useMemo(
    () =>
      THEMES.map((t) => ({
        theme: t,
        data: {
          ...data,
          design: { ...data.design, theme: t.id },
          main: {
            ...data.main,
            kicker: data.main.kicker === KICKER_BY_THEME[data.design.theme] ? KICKER_BY_THEME[t.id] : data.main.kicker,
          },
        },
      })),
    [data],
  );

  const selectTheme = (id: ThemeId) =>
    update((d) => {
      // 기본 문구를 그대로 쓰고 있었다면 새 테마에 어울리는 문구로 바꿔준다.
      if (!d.main.kicker || d.main.kicker === KICKER_BY_THEME[d.design.theme]) d.main.kicker = KICKER_BY_THEME[id];
      d.design.theme = id;
    });

  return (
    <div className="flex flex-col gap-4">
      <Card title="테마" description="배치와 분위기를 정해요. 입력한 내용은 그대로 유지돼요.">
        <div className="grid grid-cols-3 gap-2.5">
          {previews.map(({ theme: t, data: preview }) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTheme(t.id)}
              aria-pressed={current.theme === t.id}
              className="text-left"
            >
              <span
                className={cn(
                  "relative block overflow-hidden rounded-xl ring-2 transition",
                  current.theme === t.id ? "ring-brand" : "ring-transparent hover:ring-line",
                )}
              >
                <CoverThumb data={preview} />
                {current.theme === t.id && (
                  <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-brand text-white">
                    <IconCheck size={14} strokeWidth={2.6} />
                  </span>
                )}
              </span>
              <span className="mt-1.5 block text-center text-[13px] font-semibold">{t.name}</span>
            </button>
          ))}
        </div>
        {!recommended && (
          <button
            type="button"
            onClick={() =>
              update((d) => {
                d.design.palette = theme.palette;
                d.design.font = theme.font;
              })
            }
            className="self-start rounded-full bg-paper px-3 py-1.5 text-[13px] font-semibold text-ink-soft hover:bg-cream"
          >
            {theme.name} 테마 추천 색상·글꼴로 맞추기
          </button>
        )}
      </Card>

      <Card title="색상">
        <div className="grid grid-cols-4 gap-2">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={current.palette === p.id}
              onClick={() => update((d) => void (d.design.palette = p.id))}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "relative grid h-14 w-full place-items-center rounded-xl ring-2 transition",
                  current.palette === p.id ? "ring-brand" : "ring-line",
                )}
                style={{ background: p.bg }}
              >
                <span className="flex -space-x-1.5">
                  <span className="h-5 w-5 rounded-full ring-2 ring-white" style={{ background: p.surface }} />
                  <span className="h-5 w-5 rounded-full ring-2 ring-white" style={{ background: p.accent }} />
                </span>
              </span>
              <span className="text-[12px] font-medium text-ink-soft">{p.name}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="글꼴">
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={current.font === f.id}
              onClick={() => update((d) => void (d.design.font = f.id))}
              className={cn(
                "rounded-xl border px-3.5 py-3 text-left transition",
                current.font === f.id ? "border-brand bg-brand-soft/50" : "border-line hover:border-ink/25",
              )}
            >
              <link rel="stylesheet" href={f.href} precedence="default" />
              <span className="block truncate text-[17px]" style={{ fontFamily: f.family, fontSize: 17 * f.sizeAdjust }}>
                우리 결혼합니다
              </span>
              <span className="mt-0.5 block text-[12px] text-muted">{f.name}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="글자 크기">
        <Segmented<FontScale>
          value={current.fontScale}
          onChange={(v) => update((d) => void (d.design.fontScale = v))}
          options={[
            { value: "S", label: "작게" },
            { value: "M", label: "보통" },
            { value: "L", label: "크게" },
          ]}
        />
      </Card>
    </div>
  );
}
