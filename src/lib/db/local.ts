import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  GuestbookEntry,
  InvitationRecord,
  RsvpEntry,
  SessionRecord,
  Store,
  UserRecord,
} from "./types";

// 프로토타입용 로컬 저장소: .data/db.json 하나에 모든 데이터를 저장한다.
interface DB {
  users: Record<string, UserRecord>;
  sessions: Record<string, SessionRecord>;
  invitations: Record<string, InvitationRecord>;
  guestbook: Record<string, GuestbookEntry[]>;
  rsvp: Record<string, RsvpEntry[]>;
}

export const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const emptyDb = (): DB => ({ users: {}, sessions: {}, invitations: {}, guestbook: {}, rsvp: {} });

async function load(): Promise<DB> {
  try {
    return { ...emptyDb(), ...JSON.parse(await readFile(DB_FILE, "utf8")) };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return emptyDb();
    throw err;
  }
}

// Windows에서는 다른 요청이 파일을 읽는 중이면 rename이 잠깐 실패할 수 있어 몇 번 재시도한다.
async function replaceFile(tmp: string, target: string) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await rename(tmp, target);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (attempt >= 5 || (code !== "EPERM" && code !== "EBUSY")) throw err;
      await new Promise((r) => setTimeout(r, 20 * (attempt + 1)));
    }
  }
}

// 쓰기는 한 번에 하나씩(동시 저장 시 파일이 깨지지 않도록), 임시 파일에 쓴 뒤 교체한다.
let queue: Promise<unknown> = Promise.resolve();
function mutate<T>(fn: (db: DB) => T): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = fn(db);
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DB_FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(db, null, 2));
    await replaceFile(tmp, DB_FILE);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

const byNewest = <T extends { createdAt: string }>(a: T, b: T) =>
  b.createdAt.localeCompare(a.createdAt);

export const localStore: Store = {
  async findUserByProvider(provider, providerUserId) {
    const users = Object.values((await load()).users);
    return users.find((u) => u.provider === provider && u.providerUserId === providerUserId) ?? null;
  },
  async getUser(id) {
    return (await load()).users[id] ?? null;
  },
  insertUser(user) {
    return mutate((db) => {
      db.users[user.id] = user;
    });
  },
  updateUser(id, patch) {
    return mutate((db) => {
      const current = db.users[id];
      if (current) db.users[id] = { ...current, ...patch };
    });
  },

  async getSession(id) {
    return (await load()).sessions[id] ?? null;
  },
  insertSession(session) {
    return mutate((db) => {
      // 새 세션을 만들 때 만료된 세션을 함께 정리한다.
      const now = Date.now();
      for (const [id, s] of Object.entries(db.sessions)) {
        if (Date.parse(s.expiresAt) <= now) delete db.sessions[id];
      }
      db.sessions[session.id] = session;
    });
  },
  updateSessionExpiry(id, expiresAt) {
    return mutate((db) => {
      const current = db.sessions[id];
      if (current) db.sessions[id] = { ...current, expiresAt };
    });
  },
  deleteSession(id) {
    return mutate((db) => {
      delete db.sessions[id];
    });
  },

  async listInvitations(ownerId) {
    const db = await load();
    return Object.values(db.invitations)
      .filter((r) => r.ownerId === ownerId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  async getInvitation(id) {
    return (await load()).invitations[id] ?? null;
  },
  insertInvitation(record) {
    return mutate((db) => {
      db.invitations[record.id] = record;
    });
  },
  updateInvitation(id, data, updatedAt) {
    return mutate((db) => {
      const current = db.invitations[id];
      if (current) db.invitations[id] = { ...current, data, updatedAt };
    });
  },
  deleteInvitation(id) {
    return mutate((db) => {
      delete db.invitations[id];
      delete db.guestbook[id];
      delete db.rsvp[id];
    });
  },

  async listGuestbook(invitationId) {
    return [...((await load()).guestbook[invitationId] ?? [])].sort(byNewest);
  },
  async getGuestbookEntry(invitationId, entryId) {
    const entries = (await load()).guestbook[invitationId] ?? [];
    return entries.find((e) => e.id === entryId) ?? null;
  },
  insertGuestbook(entry) {
    return mutate((db) => {
      (db.guestbook[entry.invitationId] ??= []).push(entry);
    });
  },
  deleteGuestbook(invitationId, entryId) {
    return mutate((db) => {
      db.guestbook[invitationId] = (db.guestbook[invitationId] ?? []).filter(
        (e) => e.id !== entryId,
      );
    });
  },

  async listRsvp(invitationId) {
    return [...((await load()).rsvp[invitationId] ?? [])].sort(byNewest);
  },
  insertRsvp(entry) {
    return mutate((db) => {
      (db.rsvp[entry.invitationId] ??= []).push(entry);
    });
  },
};
