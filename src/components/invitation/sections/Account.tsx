"use client";

import { useState } from "react";
import { IconChevronDown, IconCopy } from "@/components/icons";
import type { AccountGroup } from "@/lib/invitation/types";
import { copyText, useInvitation } from "../context";
import { Reveal, SectionTitle, cx } from "../ui";

function Group({ group }: { group: AccountGroup }) {
  const { toast } = useInvitation();
  const [open, setOpen] = useState(false);

  return (
    <div className={cx("inv-acc", open && "is-open")}>
      <button
        type="button"
        className="inv-acc__head"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {group.title}
        <IconChevronDown size={18} />
      </button>
      {open && (
        <div className="inv-acc__body">
          {group.items.map((item) => (
            <div key={item.id} className="inv-acc__row">
              <div className="inv-acc__info">
                <p>
                  {item.role && <span className="inv-acc__role">{item.role}</span>}
                  {item.holder}
                </p>
                <p className="inv-acc__number">
                  {item.bank} {item.number}
                </p>
              </div>
              <div className="inv-acc__actions">
                <button
                  type="button"
                  onClick={async () =>
                    toast(
                      (await copyText(`${item.bank} ${item.number}`))
                        ? "계좌번호를 복사했어요."
                        : "복사하지 못했어요.",
                    )
                  }
                >
                  <IconCopy size={14} /> 복사
                </button>
                {item.kakaopay && (
                  <a className="is-kakaopay" href={item.kakaopay} target="_blank" rel="noreferrer">
                    pay
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Account() {
  const { data } = useInvitation();
  const groups = (["groom", "bride"] as const)
    .map((side) => ({ side, group: data.account[side] }))
    .filter(({ group }) => group.enabled && group.items.length > 0);
  if (!groups.length) return null;

  return (
    <section className="inv-section inv-account">
      <Reveal>
        <SectionTitle en="Account" ko={data.account.title || "마음 전하실 곳"} />
        {data.account.message && <p className="inv-text inv-text--sub">{data.account.message}</p>}
      </Reveal>
      <Reveal className="inv-acc-list">
        {groups.map(({ side, group }) => (
          <Group key={side} group={group} />
        ))}
      </Reveal>
    </section>
  );
}
