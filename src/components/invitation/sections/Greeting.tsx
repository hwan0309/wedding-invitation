"use client";

import { Fragment, useState } from "react";
import { IconFlower, IconMessage, IconPhone } from "@/components/icons";
import { fullName } from "@/lib/invitation/defaults";
import type { Parent, Person } from "@/lib/invitation/types";
import { useInvitation } from "../context";
import { Modal, Reveal, SectionTitle } from "../ui";

function ParentName({ parent }: { parent: Parent }) {
  const { data } = useInvitation();
  if (!parent.deceased) return <>{parent.name}</>;
  return (
    <span className="inv-deceased">
      {data.greeting.deceasedMark === "flower" ? (
        <IconFlower size={14} aria-label="고인" />
      ) : (
        <span className="inv-deceased__mark">故</span>
      )}
      {parent.name}
    </span>
  );
}

function ParentLine({ person, fallback }: { person: Person; fallback: string }) {
  const parents = [person.father, person.mother].filter((p) => p.name.trim());
  return (
    <p className="inv-parent">
      {parents.length > 0 && (
        <span className="inv-parent__names">
          {parents.map((p, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="inv-parent__dot">·</span>}
              <ParentName parent={p} />
            </Fragment>
          ))}
          <span className="inv-parent__of">의</span>
        </span>
      )}
      <span className="inv-parent__rel">{person.relation}</span>
      <strong>{person.firstName || fallback}</strong>
    </p>
  );
}

interface Contact {
  role: string;
  name: string;
  phone: string;
}

function contactsOf(person: Person, self: string): Contact[] {
  return [
    { role: self, name: fullName(person), phone: person.phone },
    { role: "아버지", name: person.father.name, phone: person.father.phone },
    { role: "어머니", name: person.mother.name, phone: person.mother.phone },
  ].filter((c) => c.phone.trim() && !(c.role !== self && !c.name.trim()));
}

function ContactList({ title, contacts }: { title: string; contacts: Contact[] }) {
  if (!contacts.length) return null;
  return (
    <div className="inv-contact">
      <p className="inv-contact__title">{title}</p>
      {contacts.map((c) => {
        const tel = c.phone.replace(/[^\d+]/g, "");
        return (
          <div key={c.role} className="inv-contact__row">
            <span className="inv-contact__role">{c.role}</span>
            <span className="inv-contact__name">{c.name}</span>
            <a href={`tel:${tel}`} aria-label={`${c.name}에게 전화하기`}>
              <IconPhone size={18} />
            </a>
            <a href={`sms:${tel}`} aria-label={`${c.name}에게 문자 보내기`}>
              <IconMessage size={18} />
            </a>
          </div>
        );
      })}
    </div>
  );
}

export function Greeting() {
  const { data } = useInvitation();
  const [open, setOpen] = useState(false);
  const groomContacts = contactsOf(data.groom, "신랑");
  const brideContacts = contactsOf(data.bride, "신부");
  const hasContacts = groomContacts.length + brideContacts.length > 0;

  return (
    <section className="inv-section inv-greeting">
      <Reveal>
        <SectionTitle en="Invitation" ko={data.greeting.title || "모시는 말씀"} />
        <p className="inv-text">{data.greeting.content}</p>
      </Reveal>
      {data.greeting.showParents && (
        <Reveal className="inv-parents">
          <ParentLine person={data.groom} fallback="신랑" />
          <ParentLine person={data.bride} fallback="신부" />
        </Reveal>
      )}
      {hasContacts && (
        <Reveal>
          <button type="button" className="inv-btn inv-btn--line" onClick={() => setOpen(true)}>
            <IconPhone size={16} /> 연락하기
          </button>
        </Reveal>
      )}
      <Modal open={open} title="연락하기" onClose={() => setOpen(false)}>
        <ContactList title="신랑측" contacts={groomContacts} />
        <ContactList title="신부측" contacts={brideContacts} />
      </Modal>
    </section>
  );
}
