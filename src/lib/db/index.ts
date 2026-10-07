import "server-only";
import { localStore } from "./local";
import type { Store } from "./types";

// Supabase 구현을 추가하면 여기서 환경 변수에 따라 골라 쓰면 된다.
export const store: Store = localStore;
export type {
  AuthProvider,
  GuestbookEntry,
  InvitationRecord,
  RsvpEntry,
  SessionRecord,
  UserRecord,
} from "./types";
