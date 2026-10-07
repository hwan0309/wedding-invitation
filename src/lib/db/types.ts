import type { InvitationData } from "../invitation/types";

export interface InvitationRecord {
  id: string;
  ownerId: string;
  data: InvitationData;
  createdAt: string;
  updatedAt: string;
}

export interface GuestbookEntry {
  id: string;
  invitationId: string;
  name: string;
  message: string;
  passwordHash: string;
  createdAt: string;
}

export interface RsvpEntry {
  id: string;
  invitationId: string;
  side: "groom" | "bride";
  attending: boolean;
  name: string;
  companions: number;
  meal: "yes" | "no" | "undecided";
  phone: string;
  message: string;
  createdAt: string;
}

export type AuthProvider = "kakao" | "google" | "dev";

export interface UserRecord {
  id: string;
  provider: AuthProvider;
  /** 카카오 회원번호 / 구글 sub */
  providerUserId: string;
  name: string;
  email: string;
  image: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface SessionRecord {
  /** 세션 토큰의 SHA-256 해시(저장소가 유출돼도 토큰은 알 수 없다) */
  id: string;
  userId: string;
  /** 자동 로그인(로그인 상태 유지) 여부 */
  persistent: boolean;
  expiresAt: string;
  createdAt: string;
}

/**
 * 저장소 인터페이스. 지금은 로컬 JSON 파일(local.ts)로 동작하고,
 * 배포할 때는 같은 인터페이스로 Supabase(Postgres) 구현을 붙이면 된다.
 */
export interface Store {
  findUserByProvider(provider: AuthProvider, providerUserId: string): Promise<UserRecord | null>;
  getUser(id: string): Promise<UserRecord | null>;
  insertUser(user: UserRecord): Promise<void>;
  updateUser(
    id: string,
    patch: Partial<Pick<UserRecord, "name" | "email" | "image" | "lastLoginAt">>,
  ): Promise<void>;

  getSession(id: string): Promise<SessionRecord | null>;
  insertSession(session: SessionRecord): Promise<void>;
  updateSessionExpiry(id: string, expiresAt: string): Promise<void>;
  deleteSession(id: string): Promise<void>;

  listInvitations(ownerId: string): Promise<InvitationRecord[]>;
  getInvitation(id: string): Promise<InvitationRecord | null>;
  insertInvitation(record: InvitationRecord): Promise<void>;
  updateInvitation(id: string, data: InvitationData, updatedAt: string): Promise<void>;
  deleteInvitation(id: string): Promise<void>;

  listGuestbook(invitationId: string): Promise<GuestbookEntry[]>;
  getGuestbookEntry(invitationId: string, entryId: string): Promise<GuestbookEntry | null>;
  insertGuestbook(entry: GuestbookEntry): Promise<void>;
  deleteGuestbook(invitationId: string, entryId: string): Promise<void>;

  listRsvp(invitationId: string): Promise<RsvpEntry[]>;
  insertRsvp(entry: RsvpEntry): Promise<void>;
}
