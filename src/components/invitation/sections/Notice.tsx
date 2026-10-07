"use client";

import { useState } from "react";
import { useInvitation } from "../context";
import { Reveal, SectionTitle, cx } from "../ui";

export function Notice() {
  const { data } = useInvitation();
  const items = data.notice.items;
  const [active, setActive] = useState(0);
  const current = items[Math.min(active, items.length - 1)];
  if (!current) return null;

  return (
    <section className="inv-section inv-section--surface inv-notice">
      <Reveal>
        <SectionTitle en="Information" ko={data.notice.title || "안내사항"} />
        {items.length > 1 && (
          <div className="inv-tabs" role="tablist">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={item === current}
                className={cx(item === current && "is-active")}
                onClick={() => setActive(i)}
              >
                {item.title || `안내 ${i + 1}`}
              </button>
            ))}
          </div>
        )}
        <div className="inv-card" role="tabpanel">
          <strong>{current.title}</strong>
          <p>{current.content}</p>
        </div>
      </Reveal>
    </section>
  );
}
